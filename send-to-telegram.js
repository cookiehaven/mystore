// کنترل فعال یا غیر فعال بودن ارسال به تلگرام
const enableTelegramSend = true; // true برای فعال، false برای غیرفعال

const orderForm = document.getElementById("order-section");
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
  phoneError.textContent = phoneRegex.test(phone)
    ? ""
    : "شماره موبایل باید با 09 شروع و 11 رقم باشد";
});

// نمایش فرم سفارش و مخفی کردن فرم ورود
function showOrderSection() {
  document.getElementById("auth-section").style.display = "none";
  orderForm.style.display = "block";
}

// اعتبارسنجی اولیه فرم سفارش
function validateOrder(name, phone, address, cart) {
  if (!name) {
    statusText.textContent = "نام را وارد کنید.";
    return false;
  }
  if (!phoneRegex.test(phone)) {
    statusText.textContent = "شماره موبایل معتبر نیست.";
    return false;
  }
  if (!address) {
    statusText.textContent = "آدرس را وارد کنید.";
    return false;
  }
  if (!cart || cart.length === 0) {
    statusText.textContent = "سبد خرید خالی است.";
    return false;
  }
  statusText.textContent = "";
  return true;
}

function getCartItems() {
  const cartJson = localStorage.getItem("cart");
  if (!cartJson) return [];
  try {
    return JSON.parse(cartJson);
  } catch {
    return [];
  }
}

function buildOrderMessage(name, phone, address, cart, totalPrice) {
  let message = `سفارش جدید:\nنام: ${name}\nشماره تماس: ${phone}\nآدرس: ${address}\n\nمحصولات:\n`;
  cart.forEach(item => {
    message += `${item.name} - تعداد: ${item.quantity} - قیمت واحد: ${item.price.toLocaleString()} تومان\n`;
  });
  message += `\nمجموع قیمت: ${totalPrice.toLocaleString()} تومان`;
  return message;
}

function submitOrder() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const cart = getCartItems();
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!validateOrder(name, phone, address, cart)) return;

  const orderMessage = buildOrderMessage(name, phone, address, cart, totalPrice);
  orderPreviewText.textContent = orderMessage;
  orderPreviewModal.style.display = "flex";

  // تایید سفارش:
  confirmOrderBtn.onclick = async () => {
    orderPreviewModal.style.display = "none";

    try {
      await firebase.firestore().collection("orders").add({
        name,
        phone,
        address,
        cart,
        totalPrice,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        payment: null,
        userEmail: firebase.auth().currentUser?.email || null,
      });

      if (enableTelegramSend) {
        fetch("https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: "YOUR_CHAT_ID",
            text: orderMessage,
          }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.ok) {
              statusText.textContent = "✅ سفارش و اطلاعات پرداخت با موفقیت ارسال شد!";
            } else {
              console.warn("ارسال به تلگرام ناموفق بود، اما سفارش ثبت شد:", data);
              statusText.textContent = "⚠️ سفارش ثبت شد، ولی ارسال به تلگرام انجام نشد.";
            }
          })
          .catch(err => {
            console.error("خطا در ارسال به تلگرام (ولی سفارش ثبت شد):", err);
            statusText.textContent = "⚠️ سفارش ثبت شد، ولی ارسال به تلگرام موفق نبود.";
          });
      } else {
        statusText.textContent = "✅ سفارش با موفقیت ثبت شد.";
      }

      paymentInfoSection.style.display = "block";
      paymentStatus.textContent = "";
    } catch (error) {
      console.error("خطا در ثبت سفارش در Firebase:", error);
      statusText.textContent = "❌ خطا در ثبت سفارش، لطفاً دوباره تلاش کنید.";
    }
  };

  cancelOrderBtn.onclick = () => {
    orderPreviewModal.style.display = "none";
    statusText.textContent = "سفارش لغو شد.";
  };
}

paymentForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const amount = paymentAmount.value.trim();
  const date = paymentDate.value;
  const tracking = paymentTracking.value.trim();

  if (!amount || !date || !tracking) {
    paymentStatus.textContent = "لطفا همه فیلدهای پرداخت را پر کنید.";
    return;
  }

  try {
    // ذخیره اطلاعات پرداخت آخرین سفارش کاربر (می‌توان بهبود داد برای ذخیره مشخص‌تر)
    const userEmail = firebase.auth().currentUser?.email;
    if (!userEmail) {
      paymentStatus.textContent = "ابتدا وارد شوید.";
      return;
    }

    // یافتن آخرین سفارش کاربر
    const ordersRef = firebase.firestore().collection("orders");
    const querySnapshot = await ordersRef
      .where("userEmail", "==", userEmail)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      paymentStatus.textContent = "سفارشی برای ثبت پرداخت یافت نشد.";
      return;
    }

    const orderDoc = querySnapshot.docs[0];

    await orderDoc.ref.update({
      payment: {
        amount: Number(amount),
        date,
        tracking,
      },
    });

    paymentStatus.style.color = "green";
    paymentStatus.textContent = "اطلاعات پرداخت با موفقیت ثبت شد.";
    paymentForm.reset();
    paymentInfoSection.style.display = "none";
  } catch (error) {
    console.error("خطا در ثبت اطلاعات پرداخت:", error);
    paymentStatus.style.color = "red";
    paymentStatus.textContent = "خطا در ثبت اطلاعات پرداخت، دوباره تلاش کنید.";
  }
});
