const products = [
  { id: 1, name: "کوکی شکلاتی", category: "cookie", price: 80000, image: "images/cookie-chocolate.jpg" },
  { id: 2, name: "چیزکیک لوتوس", category: "cheesecake", price: 80000, image: "images/lotos.chesese.cake.jpg" },
  { id: 3, name: "کوکی بادام‌زمینی", category: "cookie", price: 55000, image: "images/cookie-peanut.jpg" },
  { id: 4, name: "چیزکیک مارس", category: "cheesecake", price: 80000, image: "images/cheese.cake.mars.jpg" },
  { id: 5, name: "کیک هویج گردو", category: "cake", price: 80000, image: "images/cake.havij.gerdo.jpg" },
  { id: 6, name: "کیک خیس شکلاتی", category: "cake", price: 80000, image: "images/cake.khis.shokolati.jpg" },
];

function renderProducts(productArray) {
  const container = document.getElementById("product-list");
  if (!container) return;

  container.innerHTML = "";
  productArray.forEach(p => {
    const card = document.createElement("div");
    card.className = "product";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" />
      <h2>${p.name}</h2>
      <p>${p.price.toLocaleString()} تومان</p>
      <button onclick="addToCart(${p.id})">افزودن به سبد خرید</button>
    `;
    container.appendChild(card);
  });
}

function filterProducts(category) {
  const filtered = category === "all"
    ? products
    : products.filter(p => p.category === category);

  renderProducts(filtered);
}

function searchProducts() {
  const query = document.getElementById("search-input").value.toLowerCase();
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query)
  );
  renderProducts(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
  renderProducts(products);
});

// اضافه کردن توابع به window برای دسترسی در HTML
window.filterProducts = filterProducts;
window.searchProducts = searchProducts;
