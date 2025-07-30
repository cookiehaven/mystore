let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function renderCartItems() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = "<p>سبد خرید شما خالی است.</p>";
    return;
  }

  let total = 0;
  container.innerHTML = "";
  cart.forEach((item, index) => {
    total += item.price * item.quantity;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" width="100">
      <p><strong>${item.name}</strong></p>
      <p>قیمت واحد: ${item.price.toLocaleString()} تومان</p>
      <div>
        <button onclick="decreaseQuantity(${index})">➖</button>
        <span>${item.quantity}</span>
        <button onclick="increaseQuantity(${index})">➕</button>
      </div>
      <p>جمع: ${(item.price * item.quantity).toLocaleString()} تومان</p>
    `;
    container.appendChild(div);
  });

  const totalDiv = document.createElement("div");
  totalDiv.innerHTML = `<h3>مبلغ کل: ${total.toLocaleString()} تومان</h3>`;
  container.appendChild(totalDiv);
}

function increaseQuantity(index) {
  cart[index].quantity++;
  saveCart();
  renderCartItems();
}

function decreaseQuantity(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
  } else {
    cart.splice(index, 1);
  }
  saveCart();
  renderCartItems();
}

function addToCart(product) {
  const existing = cart.find(p => p.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product });
  }
  saveCart();
  renderCartItems(); // نمایش لحظه‌ای در صورت لزوم
  alert(`${product.name} به سبد خرید افزوده شد.`);
}

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

      if (cart.length === 0) {
        document.getElementById("status").textContent = "سبد خرید شما خالی است.";
        return;
      }

      const orderText = cart.map(item =>
        `• ${item.name} - ${item.quantity} عدد - ${(item.price * item.quantity).toLocaleString()} تومان`
      ).join("\n");

      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

      document.getElementById("order-preview-text").textContent =
        `سفارش‌دهنده: ${name}\nموبایل: ${phone}\nآدرس: ${address}\n\nاقلام سفارش:\n${orderText}\n\n💰 مبلغ کل: ${total.toLocaleString()} تومان`;

      document.getElementById("order-preview-modal").style.display = "flex";

      document.getElementById("confirm-order-btn").onclick = () => {
        firebase.firestore().collection("orders").add({
          uid: user.uid,
          name,
          phone,
          address,
          items: cart,
          total,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
          cart = [];
          saveCart();
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
