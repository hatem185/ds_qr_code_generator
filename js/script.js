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
let lastItemPage = 0;
let qrCodeList = [];
let qrPage = [];
let isGenerated = false;
function removeAllChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
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
generateBtn.addEventListener("click", async () => {
  if (isGenerated) return;
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
  loadingIndicator.classList.remove("hidden");
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
        new QRCode(qrCodeWrapper, {
          text: data,
          width: 200,
          height: 200,
        });
        qrCodeItem.appendChild(qrCodeWrapper);
        qrCodeList.push(qrCodeItem);
      } catch (e) {
        console.log(e);
      }
    }
    qrPage = qrCodeList.slice(0, 6);
    lastItemPage = qrPage.length;
    qrCodeContainer.append(...qrPage);
    loadingIndicator.classList.add("hidden");
    if (qrCodeList.length > 6) {
      showAllPagesBtn.classList.remove("hidden");
      qrPageSwitcher.classList.remove("hidden");
    } else {
      qrPageSwitcher.classList.add("hidden");
      showAllPagesBtn.classList.add("hidden");
    }
    isGenerated = false;
  }, 1000);
});
