const orderForm = document.getElementById("order-form");
const phoneInput = document.getElementById("phone");
const phoneError = document.getElementById("phone-error");
const statusText = document.getElementById("status");

const orderPreviewModal = document.getElementById("order-preview-modal");
const orderPreviewText = document.getElementById("order-preview-text");
const confirmOrderBtn = document.getElementById("confirm-order-btn");
const cancelOrderBtn = document.getElementById("cancel-order-btn");

const phoneRegex = /^09\d{9}$/;

// اعتبارسنجی لحظه‌ای شماره موبایل
phoneInput?.addEventListener("input", () => {
  const phone = phoneInput.value.trim();
  if (phone === "") {
    phoneError.textContent = "";
    return;
  }
  phoneError.textContent = phoneRegex.test(phone) ? "" : "شماره معتبر نیست. مثلاً: 09123456789";
});

orderForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = phoneInput.value.trim();
  const address = document.getElementById("address").value.trim();
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  if (!name || !phone || !address || cart.length === 0) {
    statusText.innerText = "⚠️ لطفاً تمام فیلدها را پر کنید و یک محصول انتخاب کنید.";
    return;
  }

  if (!phoneRegex.test(phone)) {
    phoneError.textContent = "شماره معتبر نیست. مثلاً: 09123456789";
    return;
  } else {
    phoneError.textContent = "";
  }

  // تاریخ شمسی
  const now = new Date();
  const dateStr = now.toLocaleDateString("fa-IR");
  const timeStr = now.toLocaleTimeString("fa-IR");

  // جمع کل و لیست سفارش
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const orderLines = cart.map(item =>
    `- ${item.name} × ${item.qty} = ${(item.price * item.qty).toLocaleString()} تومان`
  ).join("\n");

  // پیام پیش‌نمایش
  const previewMessage = `🍪 سفارش جدید از Cookie Haven:
📅 تاریخ: ${dateStr} - ${timeStr}
👤 نام: ${name}
📱 تماس: ${phone}
🏠 آدرس: ${address}
🛒 سفارشات:
${orderLines}

💰 جمع کل: ${totalPrice.toLocaleString()} تومان`;

  // نمایش پنجره پیش‌نمایش
  orderPreviewText.textContent = previewMessage;
  orderPreviewModal.style.display = "flex";

  // تابع ارسال سفارش
  const sendOrder = () => {
    fetch("https://api.telegram.org/bot8498305203:AAGTSIPm-EqhwXiYqMEGMdaTUCjwcVLE6g0/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: "64410546",
        text: previewMessage
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        statusText.innerText = "✅ سفارش شما با موفقیت ارسال شد!";
        localStorage.removeItem("cart");
        orderForm.reset();
      } else {
        statusText.innerText = "❌ ارسال سفارش با خطا مواجه شد.";
        console.error("Telegram API error:", data);
      }
    })
    .catch(err => {
      statusText.innerText = "❌ خطا در اتصال به سرور تلگرام.";
      console.error("Fetch error:", err);
    })
    .finally(() => {
      orderPreviewModal.style.display = "none";
      confirmOrderBtn.removeEventListener("click", sendOrder);
    });
  };

  // تنظیم دکمه‌ها
  confirmOrderBtn.onclick = sendOrder;
  cancelOrderBtn.onclick = () => {
    orderPreviewModal.style.display = "none";
    statusText.innerText = "❌ ارسال سفارش لغو شد.";
    confirmOrderBtn.onclick = null;
  };
});
