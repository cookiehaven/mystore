// === تنظیمات Firebase ===
const firebaseConfig = {
  // اینجا تنظیمات firebase خودت را بذار
  apiKey: "AIzaSyDbJwM4NRLxxgRxIPDpzV6T1wDaBjVmMtw",
  authDomain: "mycookie-a1439.firebaseapp.com",
  projectId: "mycookie-a1439",
  // بقیه تنظیمات
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// ایمیل ادمین را اینجا وارد کن
const ADMIN_EMAIL = "holmzjack@gmail.com";

// === المان‌های صفحه ===
const authSection = document.getElementById("auth-section");
const orderSection = document.getElementById("order-section");
const statusText = document.getElementById("status");
const phoneError = document.getElementById("phone-error");

// وضعیت اولیه
orderSection.style.display = "none";
authSection.style.display = "block";
statusText.textContent = "";
phoneError.textContent = "";

// === ثبت نام ===
window.signup = function() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    statusText.style.color = "red";
    statusText.textContent = "لطفا ایمیل و رمز عبور را وارد کنید.";
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      statusText.style.color = "green";
      statusText.textContent = "ثبت‌نام با موفقیت انجام شد. لطفا وارد شوید.";
    })
    .catch(error => {
      statusText.style.color = "red";
      statusText.textContent = "خطا در ثبت‌نام: " + error.message;
    });
};

// === ورود ===
window.login = function() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    statusText.style.color = "red";
    statusText.textContent = "لطفا ایمیل و رمز عبور را وارد کنید.";
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      statusText.style.color = "green";
      statusText.textContent = "ورود موفقیت‌آمیز بود.";
      showOrderSection();
    })
    .catch(error => {
      statusText.style.color = "red";
      statusText.textContent = "خطا در ورود: " + error.message;
    });
};

// === نمایش بخش سفارش بعد از ورود ===
function showOrderSection() {
  authSection.style.display = "none";
  orderSection.style.display = "block";
  statusText.textContent = "";

  // نمایش سفارش‌های کاربر یا ادمین
  viewOrders();
}

// === خروج ===
window.logout = function() {
  auth.signOut()
    .then(() => {
      authSection.style.display = "block";
      orderSection.style.display = "none";
      statusText.style.color = "green";
      statusText.textContent = "خروج با موفقیت انجام شد.";
    });
};

// === ثبت سفارش ===
window.submitOrder = function() {
  const user = auth.currentUser;
  if (!user) {
    statusText.style.color = "red";
    statusText.textContent = "لطفا ابتدا وارد شوید.";
    return;
  }

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  if (!name || !phone || !address) {
    phoneError.textContent = "لطفا همه فیلدها را پر کنید.";
    return;
  }

  phoneError.textContent = "";

  const orderData = {
    userId: user.uid,
    userEmail: user.email,
    name,
    phone,
    address,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    status: "در انتظار تایید"
  };

  db.collection("orders").add(orderData)
    .then(() => {
      statusText.style.color = "green";
      statusText.textContent = "سفارش شما ثبت شد.";
      // پاک کردن فرم
      document.getElementById("name").value = "";
      document.getElementById("phone").value = "";
      document.getElementById("address").value = "";
      viewOrders();
    })
    .catch(error => {
      statusText.style.color = "red";
      statusText.textContent = "خطا در ثبت سفارش: " + error.message;
    });
};

// === دیدن سفارش‌ها ===
window.viewOrders = function() {
  const user = auth.currentUser;
  if (!user) {
    statusText.style.color = "red";
    statusText.textContent = "لطفا ابتدا وارد شوید.";
    return;
  }

  const ordersListId = "orders-list";

  // پاک کردن لیست قبلی اگر بود
  let existingList = document.getElementById(ordersListId);
  if (existingList) existingList.remove();

  const container = document.createElement("div");
  container.id = ordersListId;
  container.style.border = "1px solid #ccc";
  container.style.padding = "10px";
  container.style.marginTop = "15px";
  container.style.textAlign = "right";
  container.style.direction = "rtl";

  statusText.textContent = "در حال بارگذاری سفارش‌ها...";

  let query = db.collection("orders").orderBy("createdAt", "desc");

  // اگر ادمین نیست، فقط سفارش‌های خودش رو میاره
  if (user.email !== ADMIN_EMAIL) {
    query = query.where("userId", "==", user.uid);
  }

  query.get()
    .then(snapshot => {
      if (snapshot.empty) {
        container.textContent = "هیچ سفارشی یافت نشد.";
      } else {
        snapshot.forEach(doc => {
          const data = doc.data();
          const div = document.createElement("div");
          div.style.borderBottom = "1px solid #eee";
          div.style.padding = "5px 0";

          div.innerHTML = `
            <b>نام:</b> ${data.name} <br/>
            <b>تلفن:</b> ${data.phone} <br/>
            <b>آدرس:</b> ${data.address} <br/>
            <b>وضعیت:</b> ${data.status} <br/>
            <b>ثبت شده توسط:</b> ${data.userEmail} <br/>
            <hr/>
          `;

          // اگر ادمین هست، دکمه تغییر وضعیت اضافه کن
          if (user.email === ADMIN_EMAIL) {
            const statusSelect = document.createElement("select");
            ["در انتظار تایید", "تایید شده", "ارسال شده", "لغو شده"].forEach(statusOption => {
              const option = document.createElement("option");
              option.value = statusOption;
              option.textContent = statusOption;
              if (data.status === statusOption) option.selected = true;
              statusSelect.appendChild(option);
            });
            statusSelect.addEventListener("change", () => {
              db.collection("orders").doc(doc.id).update({ status: statusSelect.value });
              statusText.style.color = "green";
              statusText.textContent = `وضعیت سفارش به "${statusSelect.value}" تغییر کرد.`;
            });
            div.appendChild(statusSelect);
          }

          container.appendChild(div);
        });
      }
      statusText.textContent = "";
      orderSection.appendChild(container);
    })
    .catch(error => {
      statusText.style.color = "red";
      statusText.textContent = "خطا در بارگذاری سفارش‌ها: " + error.message;
    });
};

// === بررسی وضعیت ورود خودکار هنگام لود صفحه ===
auth.onAuthStateChanged(user => {
  if (user) {
    showOrderSection();
  } else {
    authSection.style.display = "block";
    orderSection.style.display = "none";
  }
});
