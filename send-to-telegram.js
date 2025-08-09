<script src="https://cdn.emailjs.com/dist/email.min.js"></script>
<script>
  emailjs.init("OhwXhPKs1baeX0UbB");  // این رو با کلید عمومی EmailJS جایگزین کن

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
    paymentInfoSection.style.display = "none";
    statusText.innerText = "";

    // وقتی کاربر سفارش را تایید کرد، فرم پرداخت نمایش داده شود و پیش‌نمایش بسته شود
    confirmOrderBtn.onclick = () => {
      orderPreviewModal.style.display = "none";
      paymentInfoSection.style.display = "block";
    };

    // لغو سفارش
    cancelOrderBtn.onclick = () => {
      orderPreviewModal.style.display = "none";
      statusText.innerText = "❌ ارسال سفارش لغو شد.";
      confirmOrderBtn.onclick = null;
      paymentInfoSection.style.display = "none";
    };
  });

  // ارسال اطلاعات پرداخت
  paymentForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const amount = paymentAmount.value.trim();
    const date = paymentDate.value.trim();
    const tracking = paymentTracking.value.trim();

    if (!amount || !date || !tracking) {
      paymentStatus.innerText = "لطفاً تمام فیلدهای اطلاعات پرداخت را پر کنید.";
      return;
    }

    const name = document.getElementById("name").value.trim();
    const phone = phoneInput.value.trim();
    const address = document.getElementById("address").value.trim();
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const orderLines = cart.map(item =>
      `- ${item.name} × ${item.qty} = ${(item.price * item.qty).toLocaleString()} تومان`
    ).join("\n");

    const now = new Date();
    const dateStr = now.toLocaleDateString("fa-IR");
    const timeStr = now.toLocaleTimeString("fa-IR");

    const fullMessage = `🍪 سفارش جدید از Cookie Haven:
📅 تاریخ سفارش: ${dateStr} - ${timeStr}
👤 نام: ${name}
📱 تماس: ${phone}
🏠 آدرس: ${address}
🛒 سفارشات:
${orderLines}
💰 جمع کل: ${totalPrice.toLocaleString()} تومان

💳 اطلاعات پرداخت:
- مبلغ واریزی: ${amount} تومان
- تاریخ واریز: ${date}
- کد پیگیری: ${tracking}`;

    console.log("پیام ارسالی به تلگرام:", fullMessage);

    // ارسال به تلگرام
    fetch("https://api.telegram.org/bot8498305203:AAGTSIPm-EqhwXiYqMEGMdaTUCjwcVLE6g0/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: "64410546",
        text: fullMessage
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        statusText.innerText = "✅ سفارش و اطلاعات پرداخت با موفقیت ارسال شد!";
        paymentStatus.innerText = "";
        paymentInfoSection.style.display = "none";
        orderForm.reset();
        paymentForm.reset();
        localStorage.removeItem("cart");
        if (typeof renderCart === "function") renderCart();
      } else {
        paymentStatus.innerText = "❌ ارسال به تلگرام با خطا مواجه شد.";
        console.error("Telegram API error:", data);
        // تلاش برای ارسال ایمیل fallback
        sendEmailFallback(fullMessage);
      }
    })
    .catch(err => {
      paymentStatus.innerText = "❌ خطا در اتصال به سرور تلگرام.";
      console.error("Fetch error:", err);
      // تلاش برای ارسال ایمیل fallback
      sendEmailFallback(fullMessage);
    });
  });

  function sendEmailFallback(message) {
    emailjs.send("service_vsxwo1q", "template_m9pdjza", {
      message: message
    })
    .then(() => {
      statusText.innerText = "⚠️ ارسال به تلگرام انجام نشد، اما سفارش به ایمیل ارسال شد.";
      paymentStatus.innerText = "";
      paymentInfoSection.style.display = "none";
      orderForm.reset();
      paymentForm.reset();
      localStorage.removeItem("cart");
      if (typeof renderCart === "function") renderCart();
    })
    .catch(err => {
      statusText.innerText = "❌ خطا در ارسال سفارش به تلگرام و ایمیل. لطفاً دوباره تلاش کنید.";
      paymentStatus.innerText = "";
      console.error("خطا در ارسال ایمیل fallback:", err);
    });
  }
</script>
