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
import { apiUrl } from './runtime.js';
import { FIREBASE_CONFIG_FALLBACK, hasRequiredFirebaseConfig } from './firebase_config.js';

async function getFirebaseConfig() {
    try {
        const response = await fetch(apiUrl('/api/config'));
        const data = await response.json();
        const backendConfig = data.firebaseConfig || {};
        const mergedConfig = {
            ...FIREBASE_CONFIG_FALLBACK,
            ...backendConfig,
        };

        if (hasRequiredFirebaseConfig(mergedConfig)) {
            return mergedConfig;
        }

        throw new Error('Backend returned an incomplete Firebase config.');
    } catch (error) {
        console.error('Failed to fetch Firebase config from backend:', error);
        if (hasRequiredFirebaseConfig(FIREBASE_CONFIG_FALLBACK)) {
            return FIREBASE_CONFIG_FALLBACK;
        }

        throw new Error('Firebase configuration is missing apiKey/authDomain/projectId/appId.');
    }
}

// Initialize Firebase dynamically
const config = await getFirebaseConfig();
if (!hasRequiredFirebaseConfig(config)) {
    throw new Error('Firebase configuration is incomplete. Login cannot start.');
}
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
