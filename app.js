// app.js

function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("لطفا ایمیل و رمز عبور را وارد کنید");
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      alert("ورود موفقیت‌آمیز بود");
      showOrderSection(true);
    })
    .catch(error => {
      if (error.code === "auth/user-not-found") {
        // اگر کاربر پیدا نشد، ثبت نام کن
        auth.createUserWithEmailAndPassword(email, password)
          .then(userCredential => {
            alert("ثبت‌نام با موفقیت انجام شد");
            showOrderSection(true);
          })
          .catch(err => {
            alert("خطا در ثبت‌نام: " + err.message);
          });
      } else {
        alert("خطا در ورود: " + error.message);
      }
    });
}

function logout() {
  auth.signOut().then(() => {
    alert("شما از حساب کاربری خارج شدید");
    showOrderSection(false);
  });
}

function showOrderSection(show) {
  document.getElementById("auth-section").style.display = show ? "none" : "block";
  document.getElementById("order-section").style.display = show ? "block" : "none";
}

window.login = login;
window.logout = logout;

// بررسی وضعیت کاربر هنگام بارگذاری صفحه
auth.onAuthStateChanged(user => {
  if (user) {
    showOrderSection(true);
  } else {
    showOrderSection(false);
  }
});
