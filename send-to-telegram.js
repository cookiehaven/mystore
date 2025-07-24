const orderForm = document.getElementById("order-form");
const phoneInput = document.getElementById("phone");
const phoneError = document.getElementById("phone-error");
const statusText = document.getElementById("status");

const orderPreviewModal = document.getElementById("order-preview-modal");
const orderPreviewText = document.getElementById("order-preview-text");
const confirmOrderBtn = document.getElementById("confirm-order-btn");
const cancelOrderBtn = document.getElementById("cancel-order-btn");

const phoneRegex = /^09\d{9}$/;

// مرحله 2: پنجره تایید واریز (در ابتدا مخفی)
const paymentModalHTML = `
  <div id="payment-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:10000; justify-content:center; align-items:center;">
    <div style="background:#fff; padding:20px; border-radius:8px; max-width:400px; width:90%; direction: rtl; text-align: right;">
      <h3>پرداخت کارت به کارت</h3>
      <p>لطفاً مبلغ واریزی، تاریخ و کد پیگیری تراکنش را وارد کنید:</p>
      <p>شماره کارت: <strong>XXXX-XXXX-XXXX-1234</strong></p>
      <input type="text" id="payment-amount" placeholder="مبلغ واریزی (تومان)" required style="margin-bottom:10px; padding: 6px; width: 100%; box-sizing: border-box;"/>
      <input type="text" id="payment-date" placeholder="تاریخ واریز (مثلاً 1402/04/03)" required style="margin-bottom:10px; padding: 6px; width: 100%; box-sizing: border-box;"/>
      <input type="text" id="payment-tracking" placeholder="کد پیگیری تراکنش" required style="margin-bottom:10px; padding: 6px; width: 100%; box-sizing: border-box;"/>
      <div style="text-align:center; margin-top:10px;">
        <button id="confirm-payment-btn" style="padding:8px 15px; margin-right:10px;">ارسال اطلاعات پرداخت</button>
        <button id="cancel-payment-btn" style="padding:8px 15px;">انصراف</button>
      </div>
      <p id="payment-status" style="color:red; margin-top:10px;"></p>
    </div>
  </div>
`;

// اضافه کردن پنجره پرداخت به body
document.body.insertAdjacentHTML("beforeend", paymentModalHTML);

const paymentModal = document.getElementById("payment-modal");
const paymentAmountInput = document.getElementById("payment-amount");
const paymentDateInput = document.getElementById("payment-date");
const paymentTrackingInput = document.getElementById("payment-tracking");
const confirmPaymentBtn = document.getElementById("confirm-payment-btn");
const cancelPaymentBtn = document.getElementById("cancel-payment-btn");
const paymentStatus = document.getElementById("payment-status");

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

  // تابع ارسال سفارش به تلگرام (مرحله اول)
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
        // بعد از ارسال سفارش، پنجره پیش نمایش رو ببند و پنجره پرداخت رو باز کن
        orderPreviewModal.style.display = "none";
        paymentModal.style.display = "flex";
        paymentStatus.textContent = "";
        // مقداردهی اولیه فیلدهای پرداخت
        paymentAmountInput.value = totalPrice.toLocaleString();
        paymentDateInput.value = "";
        paymentTrackingInput.value = "";
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
      confirmOrderBtn.removeEventListener("click", sendOrder);
    });
  };

  // تنظیم دکمه‌های تایید و لغو پیش نمایش سفارش
  confirmOrderBtn.onclick = sendOrder;
  cancelOrderBtn.onclick = () => {
    orderPreviewModal.style.display = "none";
    statusText.innerText = "❌ ارسال سفارش لغو شد.";
    confirmOrderBtn.onclick = null;
  };
});

// ارسال اطلاعات پرداخت به تلگرام و نمایش پیام تایید به کاربر
confirmPaymentBtn.onclick = () => {
  const amount = paymentAmountInput.value.trim();
  const date = paymentDateInput.value.trim();
  const trackingCode = paymentTrackingInput.value.trim();

  if (!amount || !date || !trackingCode) {
    paymentStatus.textContent = "لطفاً همه فیلدهای پرداخت را پر کنید.";
    return;
  }

  // پیام پرداخت
  const paymentMessage = `💳 تأیید پرداخت کارت به کارت:
📅 تاریخ واریز: ${date}
💰 مبلغ واریزی: ${amount} تومان
🔖 کد پیگیری: ${trackingCode}`;

  fetch("https://api.telegram.org/bot8498305203:AAGTSIPm-EqhwXiYqMEGMdaTUCjwcVLE6g0/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: "64410546",
      text: paymentMessage
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      paymentStatus.style.color = "green";
      paymentStatus.textContent = "✅ اطلاعات پرداخت با موفقیت ارسال شد. منتظر تأیید نهایی بمانید.";
      paymentModal.style.display = "none";
      orderForm.reset();
      localStorage.removeItem("cart");
      statusText.innerText = "";
    } else {
      paymentStatus.style.color = "red";
      paymentStatus.textContent = "❌ ارسال اطلاعات پرداخت با خطا مواجه شد.";
      console.error("Telegram API error:", data);
    }
  })
  .catch(err => {
    paymentStatus.style.color = "red";
    paymentStatus.textContent = "❌ خطا در اتصال به سرور تلگرام.";
    console.error("Fetch error:", err);
  });
};

// لغو پرداخت و بازگشت به فرم سفارش
cancelPaymentBtn.onclick = () => {
  paymentModal.style.display = "none";
  statusText.innerText = "❌ ارسال اطلاعات پرداخت لغو شد.";
};
