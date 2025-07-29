// فرض بر اینه که فایل firebase-config.js قبلاً لود شده و شامل firebase.initializeApp و تعریف auth, db هست

// DOM refs
const authSection = document.getElementById("auth-section");
const welcomeSection = document.getElementById("welcome-section");
const welcomeMessage = document.getElementById("welcome-message");
const orderSection = document.getElementById("order-section");
const statusText = document.getElementById("status");

// Signup
function signup() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, pass)
    .then(() => {
      statusText.textContent = "ثبت‌نام موفقیت‌آمیز بود.";
    })
    .catch(err => {
      statusText.textContent = "خطا در ثبت‌نام: " + err.message;
    });
}

// Login
function login() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, pass)
    .then(user => {
      statusText.textContent = "ورود موفقیت‌آمیز بود.";
    })
    .catch(err => {
      statusText.textContent = "خطا در ورود: " + err.message;
    });
}

// Logout
function logout() {
  auth.signOut();
}

// فرم سفارش رو فقط بعد لاگین و با دکمه نشون بده
function toggleOrderForm() {
  orderSection.style.display = "block";
}

// ثبت سفارش
function submitOrder() {
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
  const user = auth.currentUser;

  if (!user) {
    statusText.textContent = "ابتدا وارد شوید.";
    return;
  }

  db.collection("orders").add({
    uid: user.uid,
    name,
    phone,
    address,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    statusText.textContent = "سفارش ثبت شد!";
    orderSection.style.display = "none";
  }).catch(err => {
    statusText.textContent = "خطا در ثبت سفارش: " + err.message;
  });
}

// بررسی وضعیت ورود کاربر
auth.onAuthStateChanged(user => {
  if (user) {
    authSection.style.display = "none";
    welcomeSection.style.display = "block";
    welcomeMessage.textContent = `سلام ${user.email}! خوش آمدید.`;
  } else {
    authSection.style.display = "block";
    welcomeSection.style.display = "none";
    orderSection.style.display = "none";
    welcomeMessage.textContent = "";
  }
});

// فعال کردن توابع برای HTML
window.signup = signup;
window.login = login;
window.logout = logout;
window.submitOrder = submitOrder;
window.toggleOrderForm = toggleOrderForm;
