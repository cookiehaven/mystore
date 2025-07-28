// =================== [Firebase Config] ===================
const firebaseConfig = {
  apiKey: "AIzaSyDbJwM4NRLxxgRxIPDpzV6T1wDaBjVmMtw",
  authDomain: "mycookie-a1439.firebaseapp.com",
  projectId: "mycookie-a1439",
  storageBucket: "mycookie-a1439.appspot.com",
  messagingSenderId: "488534717537",
  appId: "1:488534717537:web:1243d05aac7dca90802620"
};

const auth = firebase.auth();
const db = firebase.firestore();

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const statusText = document.getElementById("status");
const authSection = document.getElementById("auth-section");
const orderSection = document.getElementById("order-section");
const startOrderBtn = document.getElementById("start-order-btn");

function showStatus(msg, color = "green") {
  statusText.innerText = msg;
  statusText.style.color = color;
}

// ثبت‌نام کاربر جدید
function signup() {
  const email = emailInput.value;
  const password = passwordInput.value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      showStatus("ثبت‌نام موفق! حالا وارد شدید.");
    })
    .catch(error => {
      showStatus("خطا در ثبت‌نام: " + error.message, "red");
    });
}

// ورود
function login() {
  const email = emailInput.value;
  const password = passwordInput.value;

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      showStatus(`سلام ${user.email} خوش آمدید 🌟`);
      authSection.style.display = "none";
      startOrderBtn.style.display = "inline-block";
    })
    .catch(error => {
      showStatus("خطا در ورود: " + error.message, "red");
    });
}

// خروج
function logout() {
  auth.signOut().then(() => {
    showStatus("خروج انجام شد.");
    authSection.style.display = "block";
    orderSection.style.display = "none";
    startOrderBtn.style.display = "none";
  });
}

// کلیک روی دکمه "شروع سفارش"
if (startOrderBtn) {
  startOrderBtn.addEventListener("click", () => {
    orderSection.style.display = "block";
    startOrderBtn.style.display = "none";
  });
}

// فرم سفارش (تست ساده)
function submitOrder() {
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;

  if (!name || !phone || !address) {
    showStatus("لطفاً همه فیلدها را پر کنید.", "red");
    return;
  }

  showStatus("سفارش شما ثبت شد ✅");
}

// توابع جهانی
window.signup = signup;
window.login = login;
window.logout = logout;
window.submitOrder = submitOrder;
