const products = [
  { id: 1, name: "کوکی شکلاتی", price: 50000, image: "images/cookie-chocolate.jpg", category: "cookie" },
  { id: 2, name: "چیزکیک توت‌فرنگی", price: 80000, image: "images/cheesecake-strawberry.jpg", category: "cheesecake" },
  { id: 3, name: "کوکی بادام‌زمینی", price: 55000, image: "images/cookie-peanut.jpg", category: "cookie" }
];

const container = document.getElementById("product-list");
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");

function renderProducts(filteredProducts) {
  container.innerHTML = "";

  if (filteredProducts.length === 0) {
    container.innerHTML = "<p>محصولی یافت نشد.</p>";
    return;
  }

  filteredProducts.forEach(p => {
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

function filterProducts() {
  const searchText = searchInput.value.toLowerCase();
  const selectedCategory = categorySelect.value;

  const filtered = products.filter(p => {
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchText);
    return matchesCategory && matchesSearch;
  });

  renderProducts(filtered);
}

// رویدادها
searchInput?.addEventListener("input", filterProducts);
categorySelect?.addEventListener("change", filterProducts);

// بارگذاری اولیه
renderProducts(products);
