// ✅ 1. لیست محصولات با دسته‌بندی
const products = [
  { id: 1, name: "کوکی شکلاتی", category: "cookie", price: 50000, image: "images/cookie-chocolate.jpg" },
  { id: 2, name: "چیزکیک توت‌فرنگی", category: "cheesecake", price: 80000, image: "images/cheesecake-strawberry.jpg" },
  { id: 3, name: "کوکی بادام‌زمینی", category: "cookie", price: 55000, image: "images/cookie-peanut.jpg" }
];

// ✅ 2. تابع نمایش محصولات
function renderProducts(productArray) {
  const container = document.getElementById("product-list");
  if (!container) return;

  container.innerHTML = ""; // پاک کردن قبلی‌ها
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

// ✅ 3. فیلتر بر اساس دسته‌بندی
function filterProducts(category) {
  const filtered = category === "all"
    ? products
    : products.filter(p => p.category === category);

  renderProducts(filtered);
}

// ✅ 4. جست‌وجو بر اساس نام یا توضیح
function searchProducts() {
  const query = document.getElementById("search-input").value.toLowerCase();
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query)
  );
  renderProducts(filtered);
}

// ✅ 5. بارگذاری اولیه
document.addEventListener("DOMContentLoaded", () => {
  renderProducts(products);
});
