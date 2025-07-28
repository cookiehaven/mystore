// firebase-config.js
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

// Export if needed
window.auth = auth;
window.db = db;
