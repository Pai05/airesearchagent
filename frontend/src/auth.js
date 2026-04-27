// Firebase Authentication Module
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

async function getFirebaseConfig() {
    try {
        const response = await fetch('http://localhost:8000/api/config');
        const data = await response.json();
        return data.firebaseConfig;
    } catch (error) {
        console.error('Failed to fetch Firebase config from backend:', error);
        // Fallback to manual config if backend is down
        return {
            apiKey: "YOUR_API_KEY",
            authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
            projectId: "YOUR_PROJECT_ID",
            storageBucket: "YOUR_PROJECT_ID.appspot.com",
            messagingSenderId: "YOUR_SENDER_ID",
            appId: "YOUR_APP_ID",
            measurementId: "YOUR_MEASUREMENT_ID"
        };
    }
}

// Initialize Firebase dynamically
const config = await getFirebaseConfig();
const app = initializeApp(config);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export async function signUp(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
}

export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
}

export async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        throw error;
    }
}

export async function logout() {
    try {
        await signOut(auth);
        localStorage.removeItem('auth_token');
        window.location.href = 'login.html';
    } catch (error) {
        throw error;
    }
}

// Persist token for backend calls
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const token = await user.getIdToken();
        localStorage.setItem('auth_token', token);
    } else {
        localStorage.removeItem('auth_token');
    }
});
