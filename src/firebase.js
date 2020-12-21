const admin = require('firebase-admin');
const serviceAccount = require("./../serviceAccountKey.json");

const USERS_COLLECTION = 'users';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = {
  save: (chatId, user) => admin.firestore().collection(USERS_COLLECTION + chatId).doc(user.id || user.nickname).set(user),
  saveAll: async (chatId, users) => {
    const batch = admin.firestore().batch();
    console.log(users);
    users.forEach(user => batch.set(admin.firestore().collection(USERS_COLLECTION + chatId).doc(user.id || user.nickname), user));
    await batch.commit();
  },
  findAll: async (chatId) => {
    const snapshot = await admin.firestore().collection(USERS_COLLECTION + chatId).get();
    return snapshot.docs.map(doc => doc.data());
  },
}
