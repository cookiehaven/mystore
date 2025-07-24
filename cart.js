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
  const item = cart.find(p => p.id === id);
  if (!item) return;

  item.qty += change;
  if (item.qty < 1) item.qty = 1;

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
    <div class="cart-item" style="display:flex; align-items:center; margin-bottom: 10px; gap: 10px;">
      <img src="${item.image}" alt="${item.name}" style="width:60px; height:auto; border-radius:5px;"/>
      <span style="flex:1;">${item.name}</span>
      <button style="margin: 0 5px;" onclick="updateQty(${item.id}, -1)">➖</button>
      <span>${item.qty}</span>
      <button style="margin: 0 5px;" onclick="updateQty(${item.id}, 1)">➕</button>
      <span> - ${(item.price * item.qty).toLocaleString()} تومان</span>
    </div>
  `).join("");

  container.innerHTML += `<hr><div><strong>جمع کل: ${total.toLocaleString()} تومان</strong></div>`;
}

renderCart();
