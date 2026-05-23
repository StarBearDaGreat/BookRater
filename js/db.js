// Initialize Firebase safely
let db = null;
try {
  if (typeof firebase !== 'undefined') {
    // Check if firebaseConfig is defined before using it
    if (typeof firebaseConfig !== 'undefined') {
      // Only initialize if no apps exist to prevent "App already exists" error
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.firestore();
    } else {
      console.warn("firebaseConfig is not defined. Please check config.js.");
    }
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
  
  saveShelfEntry: async (ol_id, shelfName, listName = null) => {
    if (!db) return;
    try {
      const entryId = `${ol_id}_${shelfName}`; // One entry per book per primary shelf
      await db.collection('shelf_entries').doc(entryId).set({
        ol_id,
        shelf_name: shelfName,
        list_name: listName,
        date_added: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
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

  // Custom Lists (derived from distinct list_names in a shelf)
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
      // Create start and end dates for the year
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
