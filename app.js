// دریافت ارجاع به عناصر HTML
const authSection = document.getElementById('auth-section');
const orderSection = document.getElementById('order-section');
const statusText = document.getElementById('status');
const phoneError = document.getElementById('phone-error');

// ورود / ثبت‌نام
function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    statusText.textContent = 'لطفاً ایمیل و رمز عبور را وارد کنید.';
    return;
  }

  // تلاش برای ورود
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      showOrderSection();
    })
    .catch((error) => {
      if (error.code === 'auth/user-not-found') {
        // اگر کاربر پیدا نشد، ثبت‌نام می‌کنیم
        auth.createUserWithEmailAndPassword(email, password)
          .then(() => {
            showOrderSection();
          })
          .catch((err) => {
            statusText.textContent = 'خطا در ثبت‌نام: ' + err.message;
          });
      } else {
        statusText.textContent = 'خطا در ورود: ' + error.message;
      }
    });
}

// خروج
function logout() {
  auth.signOut().then(() => {
    authSection.style.display = 'block';
    orderSection.style.display = 'none';
    statusText.textContent = 'با موفقیت خارج شدید.';
  });
}

// نمایش فرم سفارش
function showOrderSection() {
  authSection.style.display = 'none';
  orderSection.style.display = 'block';
  statusText.textContent = '';
}

// ارسال سفارش
function submitOrder() {
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();

  if (!name || !phone || !address) {
    phoneError.textContent = 'لطفاً تمام فیلدها را پر کنید.';
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    phoneError.textContent = 'شما وارد نشده‌اید.';
    return;
  }

  const order = {
    name,
    phone,
    address,
    email: user.email,
    timestamp: new Date().toISOString()
  };

  db.collection('orders').add(order)
    .then(() => {
      statusText.textContent = 'سفارش ثبت شد!';
      phoneError.textContent = '';
      document.getElementById('name').value = '';
      document.getElementById('phone').value = '';
      document.getElementById('address').value = '';
    })
    .catch((error) => {
      statusText.textContent = 'خطا در ثبت سفارش: ' + error.message;
    });
}

// نمایش سفارش‌های قبلی کاربر
function viewOrders() {
  const user = auth.currentUser;
  if (!user) return;

  db.collection('orders')
    .where('email', '==', user.email)
    .orderBy('timestamp', 'desc')
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        alert('هیچ سفارشی ثبت نشده.');
        return;
      }

      let result = '';
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        result += `🧾 سفارش:\nنام: ${data.name}\nتلفن: ${data.phone}\nآدرس: ${data.address}\nزمان: ${new Date(data.timestamp).toLocaleString('fa-IR')}\n\n`;
      });

      alert(result);
    })
    .catch((error) => {
      alert('خطا در دریافت سفارش‌ها: ' + error.message);
    });
}

// بررسی وضعیت ورود هنگام بارگذاری
auth.onAuthStateChanged((user) => {
  if (user) {
    showOrderSection();
  } else {
    authSection.style.display = 'block';
    orderSection.style.display = 'none';
  }
});
