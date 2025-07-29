// نمایش فرم سفارش فقط پس از ورود
function toggleOrderForm() {
  document.getElementById("order-section").style.display = "block";
}

// ثبت سفارش
function submitOrder() {
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
  const user = auth.currentUser;
  const statusText = document.getElementById("status");

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
    document.getElementById("order-section").style.display = "none";
  }).catch(err => {
    statusText.textContent = "خطا در ثبت سفارش: " + err.message;
  });
}

// بررسی وضعیت ورود کاربر
auth.onAuthStateChanged(user => {
  const authSection = document.getElementById("auth-section");
  const welcomeSection = document.getElementById("welcome-section");
  const welcomeMessage = document.getElementById("welcome-message");

  if (user) {
    authSection.style.display = "none";
    welcomeSection.style.display = "block";
    welcomeMessage.textContent = `خوش آمدید، ${user.email}`;
  } else {
    authSection.style.display = "block";
    welcomeSection.style.display = "none";
    document.getElementById("order-section").style.display = "none";
    welcomeMessage.textContent = "";
  }
});

// ثبت‌نام
function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => location.reload())
    .catch(err => alert(err.message));
}

// ورود
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => location.reload())
    .catch(err => alert(err.message));
}

// خروج
function logout() {
  auth.signOut().then(() => location.reload());
}

// دسترسی توابع در HTML
window.signup = signup;
window.login = login;
window.logout = logout;
window.toggleOrderForm = toggleOrderForm;
window.submitOrder = submitOrder;
