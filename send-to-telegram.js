document.getElementById("order-form")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  if (!name || !phone || !address || cart.length === 0) {
    document.getElementById("status").innerText = "⚠️ لطفاً تمام فیلدها را پر کنید و یک محصول انتخاب کنید.";
    return;
  }

  // محاسبه جمع کل
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // ساخت متن سفارش با قیمت هر محصول
  const orderLines = cart.map(item =>
    `- ${item.name} × ${item.qty} = ${ (item.price * item.qty).toLocaleString()} تومان`
  ).join("\n");

  const message = `🍪 سفارش جدید از Cookie Haven:\n👤 نام: ${name}\n📱 تماس: ${phone}\n🏠 آدرس: ${address}\n🛒 سفارشات:\n${orderLines}\n\n💰 جمع کل: ${totalPrice.toLocaleString()} تومان`;

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
