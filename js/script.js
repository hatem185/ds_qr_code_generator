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
let lastItemPage = 0;
let qrCodeList = [];
let qrPage = [];
let isGenerated = false;
nextPage.addEventListener("click", async (e) => {
  e.preventDefault();
  if (qrCodeList.length <= lastItemPage) return;
  qrPage.forEach((child) => qrCodeContainer?.removeChild(child));
  qrPage = qrCodeList.slice(lastItemPage, lastItemPage + 6);
  qrCodeContainer.append(...qrPage);
  lastItemPage += qrPage.length;
});
prevPage.addEventListener("click", async (e) => {
  e.preventDefault();
  if (lastItemPage <= 6) return;
  lastItemPage -= qrPage.length;
  qrPage.forEach((child) => qrCodeContainer?.removeChild(child));
  qrPage = qrCodeList.slice(lastItemPage - 6, lastItemPage);
  qrCodeContainer.append(...qrPage);
});
generateBtn.addEventListener("click", async () => {
  if (isGenerated) return;
  const qty = qtyCode.value ?? 0;
  if (qty <= 0) return;
  qrPage.forEach((child) => qrCodeContainer?.removeChild(child));
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
  for (let i = 0; i < qty; i++) {
    try {
      const qrCodeItem = document.createElement("div");
      qrCodeItem.classList.add("qr-code-item");
      qrCodeItem.id = `qr-code-${initialNumber + i}`;
      const qrCodeText = document.createElement("h1");
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
      console.log(data);
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
  if (qrCodeList.length > 6) {
    qrPageSwitcher.classList.remove("hidden");
  } else {
    qrPageSwitcher.classList.add("hidden");
  }
  isGenerated = false;
});
