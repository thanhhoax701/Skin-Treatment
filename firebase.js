// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
    getDatabase,
    ref,
    set,
    get,
    onValue
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDvPkdR6T5lPL_ec0nkfAwg8ajUK1tmS3w",
    authDomain: "skin-treatment-e6443.firebaseapp.com",
    databaseURL: "https://skin-treatment-e6443-default-rtdb.firebaseio.com",
    projectId: "skin-treatment-e6443",
    storageBucket: "skin-treatment-e6443.firebasestorage.app",
    messagingSenderId: "852950106440",
    appId: "1:852950106440:web:5ecc588f20a24a7860b37d",
    measurementId: "G-MPLBZHSFLQ"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export { ref, set, get, onValue };
