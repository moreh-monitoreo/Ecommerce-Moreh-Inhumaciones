import admin from 'firebase-admin';
import path from 'path';

const serviceAccount = process.env.FIREBASE_CONFIG
  ? JSON.parse(process.env.FIREBASE_CONFIG)
  : require(path.join(__dirname, 'firebase-config.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? 'cobranzamovil-2b873.appspot.com',
  });
}

export const bucket = admin.storage().bucket();
