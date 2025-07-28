// =================== [Firebase Config] ===================
const firebaseConfig = {
  apiKey: "AIzaSyDbJwM4NRLxxgRxIPDpzV6T1wDaBjVmMtw",
  authDomain: "mycookie-a1439.firebaseapp.com",
  projectId: "mycookie-a1439",
  storageBucket: "mycookie-a1439.appspot.com",
  messagingSenderId: "488534717537",
  appId: "1:488534717537:web:1243d05aac7dca90802620"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// =================== [DOM Elements] ===================
const authSection = document.getElementById("auth-section");
const orderSection = document.getElementById("order-section");
const statusText = document.getElementById("status");
const adminOrdersBtn = document.createElement("button");
const ordersList = document.createElement("div");
ordersList.id = "admin-orders-list";
ordersList.style.marginTop = "1rem";

// =================== [Auth Functions] ===================
function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      statusText.innerText = "ثبت‌نام موفقیت‌آمیز بود.";
    })
    .catch((error) => {
      statusText.innerText = "خطا در ثبت‌نام: " + error.message;
    });
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      statusText.innerText = "ورود موفقیت‌آمیز بود.";
    })
    .catch((error) => {
      statusText.innerText = "خطا در ورود: " + error.message;
    });
}

function logout() {
  auth.signOut();
  statusText.innerText = "خروج انجام شد.";
}

// =================== [Order Submission] ===================
function submitOrder() {
  const user = auth.currentUser;
  if (!user) {
    alert("ابتدا وارد شوید.");
    return;
  }

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;

  if (!name || !phone || !address) {
    statusText.innerText = "همه فیلدها را پر کنید.";
    return;
  }

  db.collection("orders").add({
    userId: user.uid,
    email: user.email,
    name,
    phone,
    address,
    createdAt: new Date()
  }).then(() => {
    statusText.innerText = "سفارش با موفقیت ثبت شد.";
  }).catch((error) => {
    statusText.innerText = "خطا در ثبت سفارش: " + error.message;
  });
}

// =================== [Admin View Orders] ===================
function viewAllOrders() {
  ordersList.innerHTML = "<h3>سفارش‌های ثبت شده:</h3>";
  db.collection("orders")
    .orderBy("createdAt", "desc")
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        ordersList.innerHTML += "<p>هیچ سفارشی وجود ندارد.</p>";
      } else {
        querySnapshot.forEach((doc) => {
          const order = doc.data();
          const item = document.createElement("div");
          item.style.border = "1px solid #ccc";
          item.style.padding = "10px";
          item.style.marginBottom = "10px";
          item.style.backgroundColor = "#f9f9f9";
          item.innerHTML = `
            <p><strong>نام:</strong> ${order.name}</p>
            <p><strong>ایمیل:</strong> ${order.email}</p>
            <p><strong>تلفن:</strong> ${order.phone}</p>
            <p><strong>آدرس:</strong> ${order.address}</p>
            <p><strong>زمان:</strong> ${order.createdAt.toDate().toLocaleString()}</p>
          `;
          ordersList.appendChild(item);
        });
      }
    })
    .catch((error) => {
      ordersList.innerHTML = "<p style='color:red;'>خطا در دریافت سفارش‌ها: " + error.message + "</p>";
    });
}

// =================== [Realtime Auth Check] ===================
auth.onAuthStateChanged((user) => {
  if (user) {
    authSection.style.display = "none";
    orderSection.style.display = "block";
    statusText.innerText = "ورود با موفقیت";

    if (user.email === "holmzjack@gmail.com") {
      adminOrdersBtn.textContent = "📋 دیدن همه سفارش‌ها";
      adminOrdersBtn.onclick = viewAllOrders;
      orderSection.appendChild(adminOrdersBtn);
      orderSection.appendChild(ordersList);
    }
  } else {
    authSection.style.display = "block";
    orderSection.style.display = "none";
    ordersList.innerHTML = "";
  }
});
