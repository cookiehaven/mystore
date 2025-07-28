// مدیریت سبد خرید در localStorage
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cart")) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
  }
  saveCart(cart);
  alert("به سبد خرید اضافه شد");
  renderCart();
}

function renderCart() {
  // اگر صفحه سبد خرید هست، کد نمایش سبد را اضافه کن
  // این تابع فرضا در cart.js هم هست
}

// مدیریت ورود و ثبت‌نام با Firebase Auth

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("order-section").style.display = "block";
  } else {
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("order-section").style.display = "none";
  }
});

function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!email || !password) {
    alert("ایمیل و رمز عبور را وارد کنید.");
    return;
  }
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      alert("ورود موفق بود");
    })
    .catch(error => {
      if (error.code === "auth/user-not-found") {
        // ثبت نام خودکار
        firebase.auth().createUserWithEmailAndPassword(email, password)
          .then(() => alert("ثبت‌نام موفق بود"))
          .catch(e => alert("خطا در ثبت‌نام: " + e.message));
      } else {
        alert("خطا در ورود: " + error.message);
      }
    });
}

function logout() {
  firebase.auth().signOut();
}
