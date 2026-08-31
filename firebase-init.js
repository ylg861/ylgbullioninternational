// Centralized Firebase initialization for the static site
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyBCvOnGL0ptipChgxuCtHzviZb9DZ3MAIk",
    authDomain: "ylg-bullion-7dac6.firebaseapp.com",
    projectId: "ylg-bullion-7dac6",
    storageBucket: "ylg-bullion-7dac6.firebasestorage.app",
    messagingSenderId: "1076979932884",
    appId: "1:1076979932884:web:8755edb4ccac71f69b6541"
};

const app = initializeApp(firebaseConfig);

export { app };
