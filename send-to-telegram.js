// --- کد خودت بدون تغییر ---
const orderForm = document.getElementById("order-form");
const phoneInput = document.getElementById("phone");
const phoneError = document.getElementById("phone-error");
const statusText = document.getElementById("status");

const orderPreviewModal = document.getElementById("order-preview-modal");
const orderPreviewText = document.getElementById("order-preview-text");
const confirmOrderBtn = document.getElementById("confirm-order-btn");
const cancelOrderBtn = document.getElementById("cancel-order-btn");

const paymentInfoSection = document.getElementById("payment-info-section");
const paymentForm = document.getElementById("payment-form");
const paymentAmount = document.getElementById("payment-amount");
const paymentDate = document.getElementById("payment-date");
const paymentTracking = document.getElementById("payment-tracking");
const paymentStatus = document.getElementById("payment-status");

const phoneRegex = /^09\d{9}$/;

function validatePhone(phone) {
  return phoneRegex.test(phone);
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cart")) || [];
  } catch {
    return [];
  }
}

phoneInput?.addEventListener("input", () => {
  const phone = phoneInput.value.trim();
  phoneError.textContent = phone === "" ? "" : (validatePhone(phone) ? "" : "شماره معتبر نیست. مثلاً: 09123456789");
});

function buildOrderMessage(name, phone, address, cart) {
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const orderLines = cart.map(item =>
    `- ${item.name} × ${item.qty} = ${(item.price * item.qty).toLocaleString()} تومان`
  ).join("\n");

  const now = new Date();
  const dateStr = now.toLocaleDateString("fa-IR");
  const timeStr = now.toLocaleTimeString("fa-IR");

  return `🍪 سفارش جدید از Cookie Haven:
📅 تاریخ: ${dateStr} - ${timeStr}
👤 نام: ${name}
📱 تماس: ${phone}
🏠 آدرس: ${address}
🛒 سفارشات:
${orderLines}

💰 جمع کل: ${totalPrice.toLocaleString()} تومان`;
}

function buildFullMessage(name, phone, address, cart, amount, payDate, tracking) {
  const orderMessage = buildOrderMessage(name, phone, address, cart);
  return `${orderMessage}

💳 اطلاعات پرداخت:
- مبلغ واریزی: ${amount} تومان
- تاریخ واریز: ${payDate}
- کد پیگیری: ${tracking}`;
}

async function sendToTelegram(message) {
  const TELEGRAM_BOT_TOKEN = "8498305203:AAGTSIPm-EqhwXiYqMEGMdaTUCjwcVLE6g0";
  const CHAT_ID = "64410546";
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message })
    });

    const data = await res.json();
    return data.ok;
  } catch (error) {
    console.error("خطا در ارسال به تلگرام:", error);
    return false;
  }
}

// --- این بخش رو اصلاح کردم که حتماً EmailJS کار کنه ---
async function sendEmailFallback(message) {
  try {
    await emailjs.send("service_vsxwo1q", "template_m9pdjza", {
      message: message
    });
    statusText.innerText = "⚠️ ارسال به تلگرام انجام نشد، اما سفارش به ایمیل ارسال شد.";
    paymentStatus.innerText = "";
    paymentInfoSection.style.display = "none";
    orderForm.reset();
    paymentForm.reset();
    localStorage.removeItem("cart");
    if (typeof renderCart === "function") renderCart();
    return true;
  } catch (error) {
    console.error("خطا در ارسال ایمیل fallback:", error);
    statusText.innerText = "❌ خطا در ارسال سفارش به تلگرام و ایمیل. لطفاً دوباره تلاش کنید.";
    paymentStatus.innerText = "";
    return false;
  }
}

orderForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const phone = phoneInput.value.trim();
  const address = document.getElementById("address").value.trim();
  const cart = getCart();

  statusText.innerText = "";
  paymentStatus.innerText = "";

  if (!name || !phone || !address) {
    statusText.innerText = "⚠️ لطفاً تمام فیلدهای فرم سفارش را پر کنید.";
    return;
  }
  if (cart.length === 0) {
    statusText.innerText = "⚠️ سبد خرید شما خالی است.";
    return;
  }
  if (!validatePhone(phone)) {
    phoneError.textContent = "شماره معتبر نیست. مثلاً: 09123456789";
    return;
  } else {
    phoneError.textContent = "";
  }

  orderPreviewText.textContent = buildOrderMessage(name, phone, address, cart);
  orderPreviewModal.style.display = "flex";
  paymentInfoSection.style.display = "none";
});

confirmOrderBtn.onclick = () => {
  orderPreviewModal.style.display = "none";
  paymentInfoSection.style.display = "block";
  statusText.innerText = "";
};

cancelOrderBtn.onclick = () => {
  orderPreviewModal.style.display = "none";
  statusText.innerText = "❌ ارسال سفارش لغو شد.";
  paymentInfoSection.style.display = "none";
};

paymentForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const amount = paymentAmount.value.trim();
  const payDate = paymentDate.value.trim();
  const tracking = paymentTracking.value.trim();

  if (!amount || !payDate || !tracking) {
    paymentStatus.innerText = "⚠️ لطفاً تمام فیلدهای اطلاعات پرداخت را پر کنید.";
    return;
  }

  const name = document.getElementById("name").value.trim();
  const phone = phoneInput.value.trim();
  const address = document.getElementById("address").value.trim();
  const cart = getCart();

  const fullMessage = buildFullMessage(name, phone, address, cart, amount, payDate, tracking);

  paymentStatus.innerText = "در حال ارسال اطلاعات...";
  const success = await sendToTelegram(fullMessage);

  if (success) {
    statusText.innerText = "✅ سفارش و اطلاعات پرداخت با موفقیت ارسال شد!";
    paymentStatus.innerText = "";
    paymentInfoSection.style.display = "none";
    orderForm.reset();
    paymentForm.reset();
    localStorage.removeItem("cart");
    if (typeof renderCart === "function") renderCart();
  } else {
    await sendEmailFallback(fullMessage);
  }
});
