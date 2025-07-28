const adminUID = "ADMIN_FIREBASE_UID"; // این مقدار را از Firebase بگیرید

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => location.reload())
    .catch(() => {
      auth.createUserWithEmailAndPassword(email, password)
        .then(() => location.reload())
        .catch(err => alert(err.message));
    });
}

function logout() {
  auth.signOut().then(() => location.href = "index.html");
}

auth.onAuthStateChanged(user => {
  if (!user) return;
  if (location.pathname.includes("admin")) {
    if (user.uid === adminUID) loadAllOrders();
    else {
      alert("دسترسی فقط برای مدیر است");
      logout();
    }
  } else {
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("order-section").style.display = "block";
  }
});

function submitOrder() {
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const items = document.getElementById("items").value;
  const user = auth.currentUser;
  if (!user) return alert("ابتدا وارد شوید");

  db.collection("orders").add({
    userId: user.uid,
    name,
    phone,
    items,
    createdAt: new Date()
  }).then(() => alert("سفارش ثبت شد"));
}

function viewOrders() {
  const user = auth.currentUser;
  if (!user) return;
  db.collection("orders").where("userId", "==", user.uid)
    .orderBy("createdAt", "desc")
    .get().then(snapshot => {
      const data = snapshot.docs.map(doc => doc.data());
      alert("سفارش‌های شما:

" + data.map(d => d.items).join("\n---\n"));
    });
}

function loadAllOrders() {
  db.collection("orders").orderBy("createdAt", "desc").get()
    .then(snapshot => {
      const container = document.getElementById("orders");
      snapshot.forEach(doc => {
        const d = doc.data();
        const div = document.createElement("div");
        div.innerHTML = `
          <hr>
          <p><b>نام:</b> ${d.name}</p>
          <p><b>شماره:</b> ${d.phone}</p>
          <p><b>سفارش:</b> ${d.items}</p>
          <p><b>تاریخ:</b> ${d.createdAt.toDate().toLocaleString()}</p>
        `;
        container.appendChild(div);
      });
    });
}