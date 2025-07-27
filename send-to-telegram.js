const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN_HERE";
const TELEGRAM_CHAT_ID = "YOUR_CHAT_ID_HERE";

function formatOrder(cart, userInfo) {
  let text = "📦 سفارش جدید:\n\n";
  cart.forEach(item => {
    text += `${item.name} - تعداد: ${item.qty} - قیمت واحد: ${item.price.toLocaleString()} تومان\n`;
  });
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  text += `\n💰 جمع کل: ${total.toLocaleString()} تومان\n\n`;
  text += `👤 نام: ${userInfo.name}\n📞 شماره تماس: ${userInfo.phone}\n🏠 آدرس: ${userInfo.address}`;
  return text;
}

function validatePhone(phone) {
  const phonePattern = /^09\d{9}$/;
  return phonePattern.test(phone);
}

document.addEventListener("DOMContentLoaded", () => {
  const orderForm = document.getElementById("order-form");
  const phoneInput = document.getElementById("phone");
  const phoneError = document.getElementById("phone-error");
  const statusText = document.getElementById("status");
  const orderPreviewModal = document.getElementById("order-preview-modal");
  const orderPreviewText = document.getElementById("order-preview-text");
  const confirmOrderBtn = document.getElementById("confirm-order-btn");
  const cancelOrderBtn = document.getElementById("cancel-order-btn");
  const paymentInfoSection = document.getElementById("payment-info-section");
  const closePaymentBtn = document.getElementById("close-payment-info");

  phoneInput.addEventListener("input", () => {
    if (!validatePhone(phoneInput.value)) {
      phoneError.textContent = "شماره تماس باید با 09 شروع و 11 رقم باشد.";
      phoneError.style.color = "red";
    } else {
      phoneError.textContent = "";
    }
  });

  orderForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validatePhone(phoneInput.value)) {
      phoneError.textContent = "لطفاً شماره تماس معتبر وارد کنید.";
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cart.length === 0) {
      alert("سبد خرید شما خالی است.");
      return;
    }

    const userInfo = {
      name: document.getElementById("name").value.trim(),
      phone: phoneInput.value.trim(),
      address: document.getElementById("address").value.trim(),
    };

    const orderText = formatOrder(cart, userInfo);
    orderPreviewText.textContent = orderText;

    // نمایش پیش‌نمایش سفارش
    orderPreviewModal.style.display = "flex";

    confirmOrderBtn.onclick = () => {
      sendOrderToTelegram(orderText);
      orderPreviewModal.style.display = "none";
      orderForm.reset();
      localStorage.removeItem("cart");
      renderCart();
      paymentInfoSection.classList.remove("hidden");
      statusText.textContent = "";
    };

    cancelOrderBtn.onclick = () => {
      orderPreviewModal.style.display = "none";
    };
  });

  closePaymentBtn.onclick = () => {
    paymentInfoSection.classList.add("hidden");
  };
});

async function sendOrderToTelegram(text) {
  const url = `https://api.telegram.org/bot${8498305203:AAGTSIPm-EqhwXiYqMEGMdaTUCjwcVLE6g0}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: 64410546,
        text,
        parse_mode: "HTML",
      }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.description);
    alert("سفارش با موفقیت ارسال شد!");
  } catch (error) {
    alert("ارسال سفارش با خطا مواجه شد: " + error.message);
  }
}
