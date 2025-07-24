const products = [
  { id: 1, name: "کوکی شکلاتی", price: 50000, image: "images/cookie1.jpg" },
  { id: 2, name: "چیزکیک توت‌فرنگی", price: 80000, image: "images/cheesecake.jpg" },
  { id: 3, name: "کوکی بادام‌زمینی", price: 55000, image: "images/peanutcookie.jpg" }
];

const container = document.getElementById("product-list");
if (container) {
  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" style="width:150px; height:auto; border-radius: 8px; margin-bottom: 10px;">
      <h2>${p.name}</h2>
      <p>${p.price.toLocaleString()} تومان</p>
      <button onclick="addToCart(${p.id})">افزودن به سبد خرید</button>
    `;
    container.appendChild(card);
  });
}
