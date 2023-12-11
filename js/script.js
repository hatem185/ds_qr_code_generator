console.log("Script is running...");
const qrCodeContainer = document.getElementById("qr-code-container");
const generateBtn = document.getElementById("generate-button");
const intialSerialNumber = document.getElementById("initial-serial-number");
const qrPageSwitcher = document.getElementById("page-switcher");
const nextPage = document.getElementById("next-page");
const prevPage = document.getElementById("prev-page");
const qtyCode = document.getElementById("qty-code");
const clientText = document.getElementById("client-qr-code");
const typeQrCodeText = document.getElementById("type-qr-code");
const loadingIndicator = document.getElementById("loading-indicator");
const showAllPagesBtn = document.getElementById("show-all-page");
const alertMessage = document.getElementById("alert-message");
const latestCodeBtn = document.getElementById("latest-code-btn");
const baseUrl = "http://localhost:3000/api/qr-code-history";
const qrConfig = (data) => {
  return {
    text: data,
    width: 200,
    height: 200,
    correctLevel: QRCode.CorrectLevel.H,
  };
};
window.addEventListener("afterprint", (e) => {
  console.log("printed is done.");
});
window.matchMedia("print").addEventListener("change", (mql) => {
  console.log("hello");
});
let lastItemPage = 0;
let qrCodeList = [];
let qrPage = [];
let isGenerated = false;
function removeAllChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}
function showLoadingIndicator(show) {
  loadingIndicator.classList.toggle("hidden", !show);
}
showAllPagesBtn.addEventListener("click", async () => {
  const isShowingAll =
    showAllPagesBtn.textContent.trim().toLowerCase() === "show all";
  showAllPagesBtn.textContent = isShowingAll ? "Hide all" : "Show all";
  qrPageSwitcher.classList.toggle("hidden", isShowingAll);
  if (isShowingAll) {
    removeAllChildren(qrCodeContainer);
    qrCodeContainer.append(...qrCodeList);
  } else {
    removeAllChildren(qrCodeContainer);
    qrCodeContainer.append(...qrPage);
  }
});
nextPage.addEventListener("click", async (e) => {
  e.preventDefault();
  if (qrCodeList.length <= lastItemPage) return;
  removeAllChildren(qrCodeContainer);
  qrPage = qrCodeList.slice(lastItemPage, lastItemPage + 6);
  qrCodeContainer.append(...qrPage);
  lastItemPage += qrPage.length;
});
prevPage.addEventListener("click", async (e) => {
  e.preventDefault();
  if (lastItemPage <= 6) return;
  lastItemPage -= qrPage.length;
  removeAllChildren(qrCodeContainer);
  qrPage = qrCodeList.slice(lastItemPage - 6, lastItemPage);
  qrCodeContainer.append(...qrPage);
});
//
generateBtn.addEventListener("click", async () => {
  if (isGenerated) return;
  alertMessage.classList.add("hidden");
  const resultChecking = await checkRangeInHistory();
  console.log(resultChecking.message);
  if (resultChecking.exists === "not_exists") {
    await generateQRCodes();
    return;
  }
  alertMessage.textContent = resultChecking.message;
  alertMessage.classList.add("alert-error");
  alertMessage.classList.remove("hidden");
});
//
latestCodeBtn.addEventListener("click", async () => {
  if (isGenerated) return;
  showLoadingIndicator(true);
  const result = await getLatestCode();
  showLoadingIndicator(false);
  if (result?.latestCode != -1) {
    intialSerialNumber.value = +result.latestCode + 1;
  }
});
//
async function getLatestCode() {
  try {
    const response = await fetch(`${baseUrl}/latest-code-history`);
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      message: error,
      latestCode: -1,
    };
  }
}
//
async function checkRangeInHistory() {
  try {
    const response = await fetch(
      `${baseUrl}/check-range-in-history?serial_number=${+intialSerialNumber.value}&qty_codes=${+qtyCode.value}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    return {
      message: error,
      exists: "error",
    };
  }
}
//
async function generateQRCodes() {
  const qty = qtyCode.value ?? 0;
  if (qty <= 0) return;
  removeAllChildren(qrCodeContainer);
  qrCodeList = [];
  qrPage = [];
  lastItemPage = 0;
  let initial = intialSerialNumber.value ?? "";
  console.log(`qty: ${qty}`);
  if (typeof initial !== "string" || initial.trim().length === 0) return;
  if (isNaN(Number(initial.trim()))) {
    console.log(`invalid initial serial number`);
    return;
  }
  const initialNumber = Number(initial.trim());
  isGenerated = true;
  showLoadingIndicator(true);
  setTimeout(async () => {
    for (let i = 0; i < qty; i++) {
      try {
        const qrCodeItem = document.createElement("div");
        qrCodeItem.classList.add("qr-code-item");
        qrCodeItem.id = `qr-code-${initialNumber + i}`;
        const qrCodeText = document.createElement("h2");
        qrCodeText.classList.add("qr-code-text");
        qrCodeText.textContent = (initialNumber + i).toString();
        const qrCodeWrapper = document.createElement("div");
        qrCodeWrapper.classList.add("qr-code-wrapper");
        qrCodeWrapper.appendChild(qrCodeText);
        const data = JSON.stringify({
          type: typeQrCodeText.value,
          client: clientText.value,
          code: (initialNumber + i).toString(),
        });
        new QRCode(qrCodeWrapper, qrConfig(data));
        qrCodeItem.appendChild(qrCodeWrapper);
        qrCodeList.push(qrCodeItem);
      } catch (e) {
        console.log(e);
      }
    }
    qrPage = qrCodeList.slice(0, 6);
    lastItemPage = qrPage.length;
    qrCodeContainer.append(...qrPage);
    showLoadingIndicator(false);

    if (qrCodeList.length > 6) {
      showAllPagesBtn.classList.remove("hidden");
      qrPageSwitcher.classList.remove("hidden");
    } else {
      qrPageSwitcher.classList.add("hidden");
      showAllPagesBtn.classList.add("hidden");
    }
    isGenerated = false;
  }, 1000);
}
