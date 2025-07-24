document.getElementById("order-form")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  const phoneError = document.getElementById("phone-error");
  const phoneRegex = /^09\d{9}$/;

  if (!name || !phone || !address || cart.length === 0) {
    document.getElementById("status").innerText = "⚠️ لطفاً تمام فیلدها را پر کنید و یک محصول انتخاب کنید.";
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

  // ساخت پیام نهایی
  const message = `🍪 سفارش جدید از Cookie Haven:
📅 تاریخ: ${dateStr} - ${timeStr}
👤 نام: ${name}
📱 تماس: ${phone}
🏠 آدرس: ${address}
🛒 سفارشات:
${orderLines}

💰 جمع کل: ${totalPrice.toLocaleString()} تومان`;

  // ارسال به تلگرام
  fetch("https://api.telegram.org/bot8498305203:AAGTSIPm-EqhwXiYqMEGMdaTUCjwcVLE6g0/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: "64410546",
      text: message
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      document.getElementById("status").innerText = "✅ سفارش شما با موفقیت ارسال شد!";
      localStorage.removeItem("cart");
      document.getElementById("order-form").reset();
    } else {
      document.getElementById("status").innerText = "❌ ارسال سفارش با خطا مواجه شد.";
      console.error("Telegram API error:", data);
    }
  })
  .catch(err => {
    document.getElementById("status").innerText = "❌ خطا در اتصال به سرور تلگرام.";
    console.error("Fetch error:", err);
  });
});

// بررسی لحظه‌ای شماره موبایل هنگام تایپ
document.getElementById("phone")?.addEventListener("input", function () {
  const phone = this.value.trim();
  const phoneError = document.getElementById("phone-error");
  const phoneRegex = /^09\d{9}$/;

  if (phone === "") {
    phoneError.textContent = "";
    return;
  }

  if (!phoneRegex.test(phone)) {
    phoneError.textContent = "شماره معتبر نیست. مثلاً: 09123456789";
  } else {
    phoneError.textContent = "";
  }
});
