// Firebase config — embedded here so no external config.js dependency
const _firebaseConfig = {
  apiKey: "AIzaSyDQPWABa-ZTZVJ15oJYaYHv73fnSHRDSXI",
  authDomain: "bookrater-97ce3.firebaseapp.com",
  projectId: "bookrater-97ce3",
  storageBucket: "bookrater-97ce3.firebasestorage.app",
  messagingSenderId: "268904793874",
  appId: "1:268904793874:web:3083d8ce523bc8250955cb",
  measurementId: "G-FHCP87S0BY"
};

// Initialize Firebase safely
let db = null;
try {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      firebase.initializeApp(_firebaseConfig);
    }
    db = firebase.firestore();
    console.log("Firestore connected.");
  } else {
    console.warn("Firebase SDK not loaded.");
  }
} catch (e) {
  console.error("Firebase initialization error:", e);
}

BookRater.db = {
  // Books cache
  saveBook: async (book) => {
    if (!db) return;
    try {
      await db.collection('books').doc(book.ol_id).set(book, { merge: true });
    } catch (e) {
      console.error("Error saving book:", e);
    }
  },
  
  getBook: async (ol_id) => {
    if (!db) return null;
    try {
      const doc = await db.collection('books').doc(ol_id).get();
      return doc.exists ? doc.data() : null;
    } catch (e) {
      console.error("Error getting book:", e);
      return null;
    }
  },

  // Shelf Entries
  getShelfEntries: async (shelfName) => {
    if (!db) return [];
    try {
      const snapshot = await db.collection('shelf_entries')
        .where('shelf_name', '==', shelfName)
        .get();
      
      const entries = [];
      snapshot.forEach(doc => {
        entries.push({ id: doc.id, ...doc.data() });
      });
      return entries;
    } catch (e) {
      console.error("Error getting shelf entries:", e);
      return [];
    }
  },
  
  saveShelfEntry: async (ol_id, shelfName, listName = null, book = null) => {
    if (!db) return;
    try {
      const entryId = `${ol_id}_${shelfName}`;
      const data = {
        ol_id,
        shelf_name: shelfName,
        list_name: listName,
        date_added: firebase.firestore.FieldValue.serverTimestamp()
      };
      // Embed key book fields so shelves page never needs a separate lookup
      if (book) {
        data.title = book.title;
        data.author_name = book.author_name;
        data.cover_url = book.cover_url;
        data.first_publish_year = book.first_publish_year;
        data.ratings_average = book.ratings_average;
      }
      await db.collection('shelf_entries').doc(entryId).set(data, { merge: true });
    } catch (e) {
      console.error("Error saving shelf entry:", e);
    }
  },
  
  deleteShelfEntry: async (ol_id, shelfName) => {
    if (!db) return;
    try {
      const entryId = `${ol_id}_${shelfName}`;
      await db.collection('shelf_entries').doc(entryId).delete();
    } catch (e) {
      console.error("Error deleting shelf entry:", e);
    }
  },

  // Custom Lists
  getCustomLists: async (shelfName) => {
    if (!db) return [];
    try {
      const snapshot = await db.collection('shelf_entries')
        .where('shelf_name', '==', shelfName)
        .get();
      
      const lists = new Set();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.list_name) lists.add(data.list_name);
      });
      return Array.from(lists);
    } catch (e) {
      console.error("Error getting custom lists:", e);
      return [];
    }
  },

  // Ratings
  getRating: async (ol_id) => {
    if (!db) return null;
    try {
      const doc = await db.collection('ratings').doc(ol_id).get();
      return doc.exists ? doc.data() : null;
    } catch (e) {
      console.error("Error getting rating:", e);
      return null;
    }
  },
  
  saveRating: async (ol_id, rating, comment) => {
    if (!db) return;
    try {
      await db.collection('ratings').doc(ol_id).set({
        ol_id,
        rating,
        comment,
        updated_at: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error("Error saving rating:", e);
    }
  },

  // Goals
  getGoal: async (year) => {
    if (!db) return null;
    try {
      const doc = await db.collection('goals').doc(year.toString()).get();
      return doc.exists ? doc.data() : null;
    } catch (e) {
      console.error("Error getting goal:", e);
      return null;
    }
  },
  
  saveGoal: async (year, target) => {
    if (!db) return;
    try {
      await db.collection('goals').doc(year.toString()).set({
        year,
        target,
        updated_at: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error("Error saving goal:", e);
    }
  },
  
  getBooksReadCount: async (year) => {
    if (!db) return 0;
    try {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      
      const snapshot = await db.collection('shelf_entries')
        .where('shelf_name', '==', 'read')
        .where('date_added', '>=', startDate)
        .where('date_added', '<=', endDate)
        .get();
        
      return snapshot.size;
    } catch (e) {
      console.error("Error getting books read count:", e);
      return 0;
    }
  }
};
