let cart = JSON.parse(localStorage.getItem("cart")) || [];

// نمایش سبد خرید در cart.html
function renderCartItems() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = "<p>سبد خرید شما خالی است.</p>";
    return;
  }

  container.innerHTML = "";
  cart.forEach(item => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" width="100">
      <p><strong>${item.name}</strong></p>
      <p>${item.price.toLocaleString()} تومان</p>
    `;
    container.appendChild(div);
  });
}

// افزودن محصول به سبد خرید
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  cart.push(product);
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("محصول به سبد خرید افزوده شد.");
}

// هندل کردن سفارش
document.addEventListener("DOMContentLoaded", () => {
  renderCartItems();

  const orderForm = document.getElementById("order-form");
  if (orderForm) {
    orderForm.addEventListener("submit", e => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const phone = document.getElementById("phone").value;
      const address = document.getElementById("address").value;
      const user = firebase.auth().currentUser;

      if (!user) {
        document.getElementById("status").textContent = "ابتدا وارد شوید.";
        return;
      }

      const orderText = cart.map(item => `• ${item.name} - ${item.price.toLocaleString()} تومان`).join("\n");
      document.getElementById("order-preview-text").textContent =
        `سفارش‌دهنده: ${name}\nموبایل: ${phone}\nآدرس: ${address}\n\nاقلام سفارش:\n${orderText}`;

      // نمایش مودال تأیید
      document.getElementById("order-preview-modal").style.display = "flex";

      document.getElementById("confirm-order-btn").onclick = () => {
        firebase.firestore().collection("orders").add({
          uid: user.uid,
          name,
          phone,
          address,
          items: cart,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
          cart = [];
          localStorage.removeItem("cart");
          document.getElementById("status").textContent = "سفارش ثبت شد!";
          orderForm.reset();
          renderCartItems();
          document.getElementById("order-preview-modal").style.display = "none";
          document.getElementById("payment-info-section").style.display = "block";
        }).catch(err => {
          document.getElementById("status").textContent = "خطا در ثبت سفارش: " + err.message;
        });
      };

      document.getElementById("cancel-order-btn").onclick = () => {
        document.getElementById("order-preview-modal").style.display = "none";
      };
    });
  }

  // ارسال اطلاعات پرداخت
  const paymentForm = document.getElementById("payment-form");
  if (paymentForm) {
    paymentForm.addEventListener("submit", e => {
      e.preventDefault();
      document.getElementById("payment-status").textContent = "اطلاعات پرداخت ثبت شد (شبیه‌سازی).";
      paymentForm.reset();
    });
  }
});

window.addToCart = addToCart;
