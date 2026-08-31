// ══════════════════════════════════════════════════
//  firebase-init.js  —  YLG Bullion shared init
//  Import this instead of repeating config every page:
//
//    import { app, auth, db } from './firebase-init.js';
//
// ══════════════════════════════════════════════════

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth }        from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore }   from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey:            'AIzaSyBCvOnGL0ptipChgxuCtHzviZb9DZ3MAIk',
    authDomain:        'ylg-bullion-7dac6.firebaseapp.com',
    projectId:         'ylg-bullion-7dac6',
    storageBucket:     'ylg-bullion-7dac6.firebasestorage.app',
    messagingSenderId: '1076979932884',
    appId:             '1:1076979932884:web:8755edb4ccac71f69b6541'
};

export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
