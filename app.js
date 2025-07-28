// فرض بر این است که firebase-config.js قبلاً بارگذاری شده و auth و db تعریف شده‌اند

// انتخاب عناصر
const authSection = document.getElementById("auth-section");
const orderSection = document.getElementById("order-section");

// نمایش یا پنهان کردن بخش سفارش
function showOrderSection(show) {
  authSection.style.display = show ? "none" : "block";
  orderSection.style.display = show ? "block" : "none";
}

// ورود یا ثبت‌نام
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

// خروج
function logout() {
  auth.signOut().then(() => {
    alert("خارج شدید.");
  });
}

// بررسی وضعیت کاربر هنگام تغییر
auth.onAuthStateChanged(user => {
  showOrderSection(!!user);
});

// ارسال سفارش
async function submitOrder() {
  const user = auth.currentUser;
  if (!user) {
    alert("لطفاً ابتدا وارد شوید.");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  const cartItems = JSON.parse(localStorage.getItem("cart") || "[]");
  const itemsText = cartItems.map(item => `- ${item.name} (x${item.quantity})`).join("\n");

  if (!name || !phone || !address || cartItems.length === 0) {
    alert("لطفاً تمام فیلدها را پر کنید و سبد خرید نباید خالی باشد.");
    return;
  }

  const orderData = {
    uid: user.uid,
    email: user.email,
    name,
    phone,
    address,
    items: itemsText,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await db.collection("orders").add(orderData);
    alert("سفارش شما با موفقیت ثبت شد.");

    // تلاش برای ارسال به تلگرام (در صورت فعال بودن)
    if (typeof sendToTelegram === "function" && window.telegramEnabled !== false) {
      sendToTelegram(orderData);
    }

    // پاک کردن فرم و سبد خرید
    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("address").value = "";
    localStorage.removeItem("cart");
  } catch (error) {
    alert("خطا در ثبت سفارش: " + error.message);
  }
}

// مشاهده سفارش‌های ثبت‌شده
async function viewOrders() {
  const user = auth.currentUser;
  if (!user) {
    alert("لطفاً ابتدا وارد شوید.");
    return;
  }

  try {
    const snapshot = await db.collection("orders")
      .where("uid", "==", user.uid)
      .orderBy("createdAt", "desc")
      .get();

    if (snapshot.empty) {
      alert("شما هنوز سفارشی ثبت نکرده‌اید.");
      return;
    }

    let ordersText = "سفارش‌های شما:\n\n";
    snapshot.forEach(doc => {
      const data = doc.data();
      const date = data.createdAt ? data.createdAt.toDate().toLocaleString("fa-IR") : "تاریخ نامشخص";
      ordersText += `📅 تاریخ: ${date}\n👤 نام: ${data.name}\n📞 تلفن: ${data.phone}\n📦 آدرس: ${data.address}\n🧾 موارد:\n${data.items}\n\n`;
    });

    alert(ordersText);
  } catch (error) {
    alert("خطا در دریافت سفارش‌ها: " + error.message);
  }
}

// ثبت توابع در window برای HTML
window.login = login;
window.logout = logout;
window.submitOrder = submitOrder;
window.viewOrders = viewOrders;
