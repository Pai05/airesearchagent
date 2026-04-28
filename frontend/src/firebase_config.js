export const FIREBASE_CONFIG_FALLBACK = {
  apiKey: "AIzaSyBwF-hoZajcQcSmL5gpxDDkx1t7bOffgjI",
  authDomain: "ai-researchagent.firebaseapp.com",
  projectId: "ai-researchagent",
  storageBucket: "ai-researchagent.firebasestorage.app",
  messagingSenderId: "243986105474",
  appId: "1:243986105474:web:1c3b196ed28ed85756209b",
  measurementId: "G-J09ZQM0JG2",
};

export function hasRequiredFirebaseConfig(config) {
  if (!config || typeof config !== 'object') {
    return false;
  }

  return [
    'apiKey',
    'authDomain',
    'projectId',
    'appId',
  ].every((key) => typeof config[key] === 'string' && config[key].trim());
}