// ایمیل ادمین (اینجا تغییر بده به ایمیل خودت)
const ADMIN_EMAIL = 'holmzjack@gmail.com';

// ارجاع به Firebase
const auth = firebase.auth();
const db = firebase.firestore();

// نمایش و مخفی کردن بخش‌ها
const authSection = document.getElementById('auth-section');
const orderSection = document.getElementById('order-section');
const adminSection = document.getElementById('admin-section');
const authStatus = document.getElementById('auth-status');
const statusText = document.getElementById('status');
const allOrdersList = document.getElementById('all-orders-list');

function clearStatus() {
  authStatus.textContent = '';
  statusText.textContent = '';
}

// ثبت‌نام کاربر جدید
function signup() {
  clearStatus();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    authStatus.textContent = 'لطفاً ایمیل و رمز عبور را وارد کنید.';
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      authStatus.style.color = 'green';
      authStatus.textContent = 'ثبت‌نام موفقیت‌آمیز بود. اکنون وارد شوید.';
    })
    .catch(error => {
      authStatus.style.color = 'red';
      authStatus.textContent = 'خطا در ثبت‌نام: ' + error.message;
    });
}

// ورود کاربر
function login() {
  clearStatus();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    authStatus.textContent = 'لطفاً ایمیل و رمز عبور را وارد کنید.';
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      authSection.style.display = 'none';

      if (email === ADMIN_EMAIL) {
        adminSection.style.display = 'block';
        orderSection.style.display = 'none';
        loadAllOrders();
      } else {
        orderSection.style.display = 'block';
        adminSection.style.display = 'none';
      }
      statusText.style.color = 'green';
      statusText.textContent = 'وارد شدید!';
    })
    .catch(error => {
      authStatus.style.color = 'red';
      authStatus.textContent = 'خطا در ورود: ' + error.message;
    });
}

// خروج کاربر
function logout() {
  auth.signOut().then(() => {
    authSection.style.display = 'block';
    orderSection.style.display = 'none';
    adminSection.style.display = 'none';
    clearStatus();
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    statusText.textContent = 'خروج موفقیت‌آمیز بود.';
  });
}

// ارسال سفارش (برای کاربران عادی)
function submitOrder() {
  clearStatus();
  const user = auth.currentUser;
  if (!user) {
    statusText.style.color = 'red';
    statusText.textContent = 'لطفاً ابتدا وارد شوید.';
    return;
  }

  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();

  if (!name || !phone || !address) {
    statusText.style.color = 'red';
    statusText.textContent = 'لطفاً همه فیلدها را پر کنید.';
    return;
  }

  const orderData = {
    userId: user.uid,
    userEmail: user.email,
    name,
    phone,
    address,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    status: 'pending' // وضعیت سفارش، مثلا pending یا completed
  };

  db.collection('orders').add(orderData)
    .then(() => {
      statusText.style.color = 'green';
      statusText.textContent = 'سفارش با موفقیت ثبت شد.';
      // پاک کردن فرم
      document.getElementById('name').value = '';
      document.getElementById('phone').value = '';
      document.getElementById('address').value = '';
    })
    .catch(error => {
      statusText.style.color = 'red';
      statusText.textContent = 'خطا در ثبت سفارش: ' + error.message;
    });
}

// دیدن سفارش‌های کاربر عادی
function viewOrders() {
  clearStatus();
  const user = auth.currentUser;
  if (!user) {
    statusText.style.color = 'red';
    statusText.textContent = 'لطفاً ابتدا وارد شوید.';
    return;
  }

  db.collection('orders')
    .where('userId', '==', user.uid)
    .orderBy('timestamp', 'desc')
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        statusText.style.color = 'blue';
        statusText.textContent = 'سفارشی ثبت نشده است.';
        return;
      }

      let ordersText = 'سفارش‌های شما:\n\n';
      snapshot.forEach(doc => {
        const data = doc.data();
        ordersText += `نام: ${data.name}\nشماره تماس: ${data.phone}\nآدرس: ${data.address}\nوضعیت: ${data.status}\n\n`;
      });
      alert(ordersText);
    })
    .catch(error => {
      statusText.style.color = 'red';
      statusText.textContent = 'خطا در دریافت سفارش‌ها: ' + error.message;
    });
}

// بارگذاری همه سفارش‌ها برای ادمین
function loadAllOrders() {
  allOrdersList.innerHTML = 'در حال بارگذاری سفارش‌ها...';

  db.collection('orders')
    .orderBy('timestamp', 'desc')
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        allOrdersList.innerHTML = 'سفارشی موجود نیست.';
        return;
      }

      let html = '<ul style="text-align:right; direction:rtl;">';
      snapshot.forEach(doc => {
        const data = doc.data();
        html += `<li style="border-bottom:1px solid #ccc; margin-bottom:8px; padding-bottom:8px;">
          <strong>نام:</strong> ${data.name}<br/>
          <strong>ایمیل:</strong> ${data.userEmail}<br/>
          <strong>شماره تماس:</strong> ${data.phone}<br/>
          <strong>آدرس:</strong> ${data.address}<br/>
          <strong>وضعیت:</strong> ${data.status}<br/>
          <button onclick="updateOrderStatus('${doc.id}', 'completed')">علامت‌گذاری به عنوان تکمیل‌شده</button>
        </li>`;
      });
      html += '</ul>';

      allOrdersList.innerHTML = html;
    })
    .catch(error => {
      allOrdersList.innerHTML = 'خطا در بارگذاری سفارش‌ها: ' + error.message;
    });
}

// تغییر وضعیت سفارش توسط ادمین
function updateOrderStatus(orderId, newStatus) {
  db.collection('orders').doc(orderId).update({ status: newStatus })
    .then(() => {
      loadAllOrders();
    })
    .catch(error => {
      alert('خطا در بروزرسانی وضعیت: ' + error.message);
    });
}

// بررسی وضعیت ورود هنگام بارگذاری صفحه (برای حفظ لاگین)
auth.onAuthStateChanged(user => {
  if (user) {
    authSection.style.display = 'none';

    if (user.email === ADMIN_EMAIL) {
      adminSection.style.display = 'block';
      orderSection.style.display = 'none';
      loadAllOrders();
    } else {
      orderSection.style.display = 'block';
      adminSection.style.display = 'none';
    }

    statusText.style.color = 'green';
    statusText.textContent = 'وارد شده با ایمیل: ' + user.email;
  } else {
    authSection.style.display = 'block';
    orderSection.style.display = 'none';
    adminSection.style.display = 'none';
    clearStatus();
  }
});
