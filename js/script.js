console.log("Script is running...");
const qrCodeContainer = document.getElementById("qr-code-container");
const generateBtn = document.getElementById("generate-button");
const intialSerialNumber = document.getElementById("initial-serial-number");
const qrPageSwitcher = document.getElementById("page-switcher");
const nextPage = document.getElementById("next-page");
const prevPage = document.getElementById("prev-page");
const qtyCode = document.getElementById("qty-code");
const numberOfPages = document.getElementById("number-of-pages-code");
const clientText = document.getElementById("client-qr-code");
const typeQrCodeText = document.getElementById("type-qr-code");
const loadingIndicator = document.getElementById("loading-indicator");
const showAllPagesBtn = document.getElementById("show-all-page");
const alertMessage = document.getElementById("alert-message");
const latestCodeBtn = document.getElementById("latest-code-btn");
const historyListElement = document.getElementById("history-list");
const prevHistoryPage = document.getElementById("prev-history-page");
const nextHistoryPage = document.getElementById("next-history-page");
const limitOfNumberPage = 16;
let baseUrl = "";
let lastItemPage = 0;
let qrCodeList = [];
let qrPage = [];
let currentHistoryPage = 1;
const qrHistoryData = {
  page: 1,
  fetchedLength: 0,
  data: [],
};
let isGenerated = false;
/////////////////////
function removeAllChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}
///////////////////
function setBaseUrl() {
  const pageUrl = window.location.href;
  if (pageUrl.includes("localhost") || pageUrl.includes("127.0.0.1")) {
    baseUrl = "http://localhost:3000/api/qr-code-history";
  } else {
    baseUrl = "https://dssystemqrcodehistory.onrender.com/api/qr-code-history";
  }
}
setBaseUrl();
////////////////
const qrConfig = (data) => {
  return {
    text: data,
    width: 200,
    height: 200,
    correctLevel: QRCode.CorrectLevel.H,
  };
};
//////////////
function resetHistoryListElement(fromIndex, toIndex) {
  removeAllChildren(historyListElement);
  const elements = qrHistoryData.data.slice(fromIndex, toIndex).map((e) => {
    const li = createHistoryCardElement(e);
    li.addEventListener("click", async () => {
      const value = window.prompt(
        "Please enter the starting code within the specified range for generation"
      );
      if (
        value &&
        +value > e.first_code &&
        +value < e.first_code + e.qty_codes - 1
      ) {
        intialSerialNumber.value = value;
        qtyCode.value = e.qty_codes - (+value - e.first_code);
        console.log(e.qty_codes);
        console.log(value);
        console.log(e.first_code);
        console.log(`${qtyCode.value},${intialSerialNumber.value}`);
      } else {
        intialSerialNumber.value = e.first_code;
        qtyCode.value = e.qty_codes;
      }
      typeQrCodeText.value = e.type;
      await generateQRCodes(false);
    });
    return li;
  });
  historyListElement.append(...elements);
}
/////////////
function createHistoryCardElement(data) {
  const li = document.createElement("li");
  const startCodeText = document.createElement("h4");
  startCodeText.textContent = `Fisrt code: ${data.first_code}`;
  const lasCodeText = document.createElement("h4");
  lasCodeText.textContent = `Last code: ${data.last_code}`;
  const createdAtText = document.createElement("h4");
  createdAtText.textContent = `Create At: ${formatTimestamp(data.createdAt)}`;
  li.append(...[startCodeText, lasCodeText, createdAtText]);
  li.classList.add("history-card");
  return li;
}
nextHistoryPage.addEventListener("click", async () => {
  const fromIndex = currentHistoryPage * 4;
  if (qrHistoryData.data.length > fromIndex) {
    resetHistoryListElement(fromIndex, fromIndex + 4);
    currentHistoryPage += 1;
  } else if (
    fromIndex >= qrHistoryData.data.length &&
    qrHistoryData.fetchedLength === 16
  ) {
    await loadHistories(qrHistoryData.page + 1);
    if (qrHistoryData.data.length > fromIndex) {
      resetHistoryListElement(fromIndex, fromIndex + 4);
      currentHistoryPage += 1;
    }
  } else {
    currentHistoryPage = 1;
    qrHistoryData.data = [];
    await loadHistories(1);
    resetHistoryListElement(0, 4);
  }
});
prevHistoryPage.addEventListener("click", async (e) => {
  e.preventDefault();
  if (currentHistoryPage === 1) return;
  currentHistoryPage--;
  const lastItemIndex = currentHistoryPage * 4;
  resetHistoryListElement(lastItemIndex - 4, lastItemIndex);
});
async function loadHistories(page) {
  const result = await fetchHistories(page);
  qrHistoryData.fetchedLength = result.fetchedLength;
  qrHistoryData.page = result.page;
  qrHistoryData.data.push(...result.data);
}
async function fetchHistories(page = 1, limit = limitOfNumberPage) {
  try {
    const response = await fetch(
      `${baseUrl}/histories?page=${page}&limit=${limit}`
    );
    data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    return null;
  }
}
(async () => {
  await loadHistories(1);
  resetHistoryListElement(0, 4);
})();
/////////////////
function getNumberOfGeneratedCode() {
  const nop = numberOfPages.value;
  console.log(numberOfPages.value);
  const qty = qtyCode.value;
  if (nop && !isNaN(+nop) && +nop > 0) {
    return +nop * 6;
  } else if (+qty && !isNaN(+qty) && +qty > 0) {
    return +qty;
  }
  return 0;
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
function showAlertMessage(message, type) {
  alertMessage.classList.remove("alert-error");
  alertMessage.classList.remove("alert-success");
  alertMessage.textContent = message;
  alertMessage.classList.add(type);
  alertMessage.classList.remove("hidden");
}
generateBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  alertMessage.classList.add("hidden");
  if (!formValidation()) return;
  if (isGenerated) return;
  const resultChecking = await checkRangeInHistory();
  console.log(resultChecking.message);
  if (resultChecking.exists === "not_exists") {
    await generateQRCodes();
    return;
  }
  showAlertMessage(resultChecking.message, "alert-error");
});
//////////////////////
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
  const qty = getNumberOfGeneratedCode();
  console.log(`Checking range in history: ${qty}`);
  console.log(`Checking range in history: ${intialSerialNumber.value}, ${qty}`);
  try {
    const response = await fetch(
      `${baseUrl}/check-range-in-history?serial_number=${+intialSerialNumber.value}&qty_codes=${qty}`
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
async function saveGeneratedQrCodes(initNumber, qty = 0) {
  const result = await saveGenratedRangeHistory(initNumber, qty);
  if (result != null) {
    showAlertMessage(result.message, "alert-success");
    console.log(result.data);
  } else {
    showAlertMessage(
      `Invalid range history response from server`,
      "alert-error"
    );
    console.log(`Invalid range history response from server`);
  }
}
async function saveGenratedRangeHistory(initNumber, qty = 0) {
  try {
    const dataForm = JSON.stringify({
      serial_number: initNumber,
      qty_codes: qty,
      printed_pages_number: 0,
      type: capitalise(typeQrCodeText.value),
    });
    console.log(`Saved range history: ${dataForm}`);
    const response = await fetch(`${baseUrl}/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: dataForm,
    });
    const data = await response.json();
    if (response.status == 201) {
      return data;
    }
  } catch (error) {
    console.log(error);
  }
  return null;
}
//
async function generateQRCodes(saveHistory = true) {
  const qty = getNumberOfGeneratedCode();
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
  const initialNumber = +initial.trim();
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
          type: capitalise(typeQrCodeText.value),
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
    if (saveHistory) await saveGeneratedQrCodes(+intialSerialNumber.value, qty);
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
function formatTimestamp(timestampString) {
  const dateObj = new Date(timestampString);
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const day = dateObj.getDate().toString().padStart(2, "0");
  const hours = dateObj.getHours() === 0 ? 12 : dateObj.getHours();
  const minutes = dateObj.getMinutes().toString().padStart(2, "0");
  const amPm = dateObj.getHours() >= 12 ? "PM" : "AM";

  return `${year}-${month}-${day} ${hours}:${minutes} ${amPm}`;
}
function formValidation() {
  const type = typeQrCodeText.value;
  if (!(type.length > 0)) {
    showAlertMessage("Please enter the type of QR code", "alert-error");
    return false;
  }
  if (type.toLowerCase() !== "orders" && type.toLowerCase() !== "box") {
    showAlertMessage("QR code type is invalid", "alert-error");
    return false;
  }
  if (!(intialSerialNumber.value.trim().length > 0)) {
    showAlertMessage("Please enter the intial Serial Number", "alert-error");
    return false;
  }
  const qty = +qtyCode.value;
  const nop = +numberOfPages.value;
  console.log(`qty: ${isNaN(qty) || qty <= 0}, nop: ${isNaN(nop) || nop <= 0}`);
  console.log(`${qty}, ${nop}`);
  if ((isNaN(qty) || qty <= 0) && (isNaN(nop) || nop <= 0)) {
    showAlertMessage(
      "Please enter valid quantity of page of numbers",
      "alert-error"
    );
    return false;
  }
  return true;
}
numberOfPages.addEventListener("keydown", (e) => {
  qtyCode.value = 0;
});

function capitalise(str = "") {
  const strArr = str.split("");
  return strArr[0].toUpperCase().concat(strArr.slice(1).join(""));
}
