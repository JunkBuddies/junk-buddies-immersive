// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyATgzi3inC_jld8GBJqG9zB8Dusx9qSOkY',
  authDomain: 'junk-buddies-app.firebaseapp.com',
  projectId: 'junk-buddies-app',
  storageBucket: 'junk-buddies-app.appspot.com',
  messagingSenderId: '479062629182',
  appId: '1:479062629182:web:e798db4fd8bae8efda2a6f',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
