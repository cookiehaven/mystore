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
}

function renderCart() {
  const items = getCart();
  const container = document.getElementById("cart-items");
  if (!container) return;

  container.innerHTML = items.map(item => `
    <div class="cart-item">
      ${item.name} × ${item.qty} - ${item.price.toLocaleString()} تومان
    </div>
  `).join("");
}
renderCart();
