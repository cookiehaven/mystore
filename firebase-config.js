// ⚠️ مقدارها را از داشبورد Firebase خود جایگزین کنید
const firebaseConfig = {
  apiKey: "AIzaSyDbJwM4NRLxxgRxIPDpzV6T1wDaBjVmMtw",
  authDomain: "mycookie-a1439.firebaseapp.com",
  projectId: "mycookie-a1439",
  storageBucket: "mycookie-a1439.firebasestorage.app",
  messagingSenderId: "488534717537",
  appId: "1:488534717537:web:1243d05aac7dca90802620"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
