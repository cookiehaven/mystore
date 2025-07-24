const products = [
  { id: 1, name: "کوکی شکلاتی", price: 50000 },
  { id: 2, name: "چیزکیک توت‌فرنگی", price: 80000 },
  { id: 3, name: "کوکی بادام‌زمینی", price: 55000 }
];

const container = document.getElementById("product-list");
if (container) {
  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product";
    card.innerHTML = `
      <h2>${p.name}</h2>
      <p>${p.price.toLocaleString()} تومان</p>
      <button onclick="addToCart(${p.id})">افزودن به سبد خرید</button>
    `;
    container.appendChild(card);
  });
}
