const products = [
  { id: 1, name: "کوکی شکلاتی", category: "cookie", price: 50000, image: "images/cookie-chocolate.jpg" },
  { id: 2, name: "چیزکیک لوتوس", category: "cheesecake", price: 1100000, image: "images/lotos.chesese.cake.jpg" },
  { id: 3, name: "کوکی بادام‌زمینی", category: "cookie", price: 55000, image: "images/cookie-peanut.jpg" },
  { id: 4, name: "چیزکیک مارس", category: "cheesecake", price: 1300000, image: "images/cheese.cake.mars.jpg" },
  { id: 5, name: "کیک هویج گردو", category: "cake", price: 500000, image: "images/cake.havij.gerdo.jpg" },
  { id: 6, name: "کیک خیس شکلاتی", category: "cake", price: 750000, image: "images/cake.khis.shokolati.jpg" },
  { id: 7, name: "کیک ردولوت", category: "cake", price: 800000, image: "images/cake.redvevet.jpg" },
  { id: 8, name: "چیزکیک نوتلا تک نفره", category: "cake", price: 130000, image: "images/cheeese.cake.nutela.jpg" },
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
      <button class="add-to-cart-btn" data-id="${p.id}">افزودن به سبد خرید</button>
    `;
    container.appendChild(card);
  });

  // Attach event listeners to "add to cart" buttons
  document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const user = firebase.auth().currentUser;
      if (!user) {
        alert("لطفاً ابتدا وارد شوید.");
        return;
      }
      const id = parseInt(e.target.getAttribute("data-id"));
      window.addToCart(id);
    });
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
  firebase.auth().onAuthStateChanged(() => {
    renderProducts(products);
  });
});

window.filterProducts = filterProducts;
window.searchProducts = searchProducts;
