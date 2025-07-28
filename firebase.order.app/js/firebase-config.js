// ⚠️ مقدارها را از داشبورد Firebase خود جایگزین کنید
const firebaseConfig = {
  apiKey: "AIzaSyDbJwM4NRLxxgRxIPDpzV6T1wDaBjVmMtw",
  authDomain: "mycookie-a1439.firebaseapp.com",
  projectId: "mycookie-a1439",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
