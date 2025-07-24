document.getElementById("order-form")?.addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  const message = `🍪 سفارش جدید از Cookie Haven:%0A
👤 نام: ${name}
📱 تماس: ${phone}
🏠 آدرس: ${address}
🛒 سفارشات:%0A${cart.map(i => `- ${i.name} × ${i.qty}`).join("%0A")}`;

  fetch("https://api.telegram.org/bot8498305203:AAGTSIPm-EqhwXiYqMEGMdaTUCjwcVLE6g0/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: "64410546",
      text: message,
      parse_mode: "HTML"
    })
  })
  .then(() => {
    document.getElementById("status").innerText = "✅ سفارش شما ارسال شد!";
    localStorage.removeItem("cart");
  })
  .catch(() => {
    document.getElementById("status").innerText = "❌ خطا در ارسال سفارش. لطفاً دوباره تلاش کنید.";
  });
});
