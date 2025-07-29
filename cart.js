const auth = firebase.auth();
const db = firebase.firestore();

function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(id) {
  const cart = getCart();
  const existing = cart.find(p => p.id === id);
  if (existing) {
    existing.qty++;
  } else {
    const product = products.find(p => p.id === id);
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  alert("به سبد خرید اضافه شد!");
  renderCart();
}

function updateQty(id, change) {
  const cart = getCart();
  const itemIndex = cart.findIndex(p => p.id === id);
  if (itemIndex === -1) return;

  cart[itemIndex].qty += change;

  if (cart[itemIndex].qty < 1) {
    cart.splice(itemIndex, 1);
  }

  saveCart(cart);
  renderCart();
}

function renderCart() {
  const items = getCart();
  const container = document.getElementById("cart-items");
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = "<p>سبد خرید شما خالی است.</p>";
    return;
  }

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  container.innerHTML = items.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" />
      <span style="flex:1;">${item.name}</span>
      <div>
        <button onclick="updateQty(${item.id}, -1)">➖</button>
        <span>${item.qty}</span>
        <button onclick="updateQty(${item.id}, 1)">➕</button>
      </div>
      <span>${(item.price * item.qty).toLocaleString()} تومان</span>
    </div>
  `).join("");

  container.innerHTML += `<hr><div><strong>جمع کل: ${total.toLocaleString()} تومان</strong></div>`;
}

document.getElementById("order-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    document.getElementById("status").textContent = "لطفاً ابتدا وارد شوید.";
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    document.getElementById("status").textContent = "سبد خرید خالی است.";
    return;
  }

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;

  try {
    await db.collection("orders").add({
      uid: user.uid,
      name,
      phone,
      address,
      cart,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    document.getElementById("status").textContent = "سفارش ثبت شد!";
    localStorage.removeItem("cart");
    renderCart();
    this.reset();
  } catch (err) {
    document.getElementById("status").textContent = "خطا در ثبت سفارش: " + err.message;
  }
});

renderCart();
