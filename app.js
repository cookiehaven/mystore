// فرض بر این است که firebase-config.js قبلاً لود شده و
// ثابت‌های auth و db تعریف شده‌اند

const authSection = document.getElementById("auth-section");
const orderSection = document.getElementById("order-section");

function showOrderSection(show) {
  if (show) {
    authSection.style.display = "none";
    orderSection.style.display = "block";
  } else {
    authSection.style.display = "block";
    orderSection.style.display = "none";
  }
}

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("لطفاً ایمیل و رمز عبور را وارد کنید.");
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(email, password);
    alert("ورود موفقیت‌آمیز بود!");
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      try {
        await auth.createUserWithEmailAndPassword(email, password);
        alert("ثبت‌نام موفقیت‌آمیز بود و وارد شدید.");
      } catch (regError) {
        alert("خطا در ثبت‌نام: " + regError.message);
      }
    } else {
      alert("خطا در ورود: " + error.message);
    }
  }
}

function logout() {
  auth.signOut().then(() => {
    alert("خروج انجام شد.");
  });
}

auth.onAuthStateChanged(user => {
  if (user) {
    showOrderSection(true);
  } else {
    showOrderSection(false);
  }
});

async function submitOrder() {
  const user = auth.currentUser;
  if (!user) {
    alert("لطفاً ابتدا وارد شوید.");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  if (!name || !phone || !address) {
    alert("لطفاً تمام فیلدها (نام، شماره، آدرس) را وارد کنید.");
    return;
  }

  const orderData = {
    uid: user.uid,
    email: user.email,
    name,
    phone,
    address,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await db.collection("orders").add(orderData);
    alert("سفارش شما ثبت شد.");

    // پاک کردن فرم
    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("address").value = "";

    // ارسال به تلگرام (اختیاری اگر فایل send-to-telegram.js موجود باشد)
    if (typeof sendOrderToTelegram === "function") {
      sendOrderToTelegram(orderData);
    }

  } catch (error) {
    alert("خطا در ثبت سفارش: " + error.message);
  }
}

async function viewOrders() {
  const user = auth.currentUser;
  if (!user) {
    alert("لطفاً ابتدا وارد شوید.");
    return;
  }

  try {
    const querySnapshot = await db.collection("orders")
      .where("uid", "==", user.uid)
      .orderBy("createdAt", "desc")
      .get();

    if (querySnapshot.empty) {
      alert("شما هنوز سفارشی ثبت نکرده‌اید.");
      return;
    }

    let ordersText = "سفارش‌های شما:\n\n";
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const date = data.createdAt ? data.createdAt.toDate().toLocaleString("fa-IR") : "تاریخ نامشخص";
      ordersText += `- تاریخ: ${date}\n  نام: ${data.name}\n  شماره تماس: ${data.phone}\n  آدرس: ${data.address}\n\n`;
    });

    alert(ordersText);

  } catch (error) {
    alert("خطا در دریافت سفارش‌ها: " + error.message);
  }
}

// اضافه کردن توابع به window برای در دسترس بودن از HTML
window.login = login;
window.logout = logout;
window.submitOrder = submitOrder;
window.viewOrders = viewOrders;
