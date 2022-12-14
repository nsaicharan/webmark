import { createContext, useContext, useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from './../utils/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export const BookmarksContext = createContext();
export const useBookmarks = () => useContext(BookmarksContext);

export function BookmarksProvider({ children }) {
  const [user, loading] = useAuthState(auth);
  const [bookmarks, setBookmarks] = useState([]);
  const [existingCategories, setExistingCategories] = useState({});
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;

    const collectionRef = collection(db, `users/${user.email}/bookmarks`);
    const q = query(collectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bookmarksData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      const categories = bookmarksData.reduce((accumulator, bookmark) => {
        if (!accumulator[bookmark.category]) {
          accumulator[bookmark.category] = 1;
        } else {
          accumulator[bookmark.category]++;
        }

        return accumulator;
      }, {});

      const sortedCategories = Object.keys(categories)
        .sort()
        .reduce((accumulator, key) => {
          accumulator[key] = categories[key];

          return accumulator;
        }, {});

      setBookmarks(bookmarksData);
      setExistingCategories(sortedCategories);
      setFetching(false);
    });

    return unsubscribe;
  }, [user]);

  async function deleteBookmark(id) {
    if (window.confirm('Are you sure you want to delete?')) {
      const docRef = doc(db, `users/${user.email}/bookmarks/${id}`);
      await deleteDoc(docRef);
    }
  }

  async function addBookmark({ url, title, category, notes }) {
    const collectionRef = collection(db, `users/${user.email}/bookmarks`);
    await addDoc(collectionRef, {
      url: url.trim(),
      title: title.trim(),
      category: category.trim().toLowerCase() || 'uncategorized',
      notes: notes.trim(),
      createdAt: serverTimestamp(),
    });
  }

  async function updateBookmark({ id, url, title, category, notes }) {
    const docRef = doc(db, `users/${user.email}/bookmarks/${id}`);
    await setDoc(
      docRef,
      {
        url: url.trim(),
        title: title.trim(),
        category: category.trim().toLowerCase() || 'uncategorized',
        notes: notes.trim(),
      },
      { merge: true }
    );
  }

  return (
    <BookmarksContext.Provider
      value={{
        bookmarks,
        existingCategories,
        deleteBookmark,
        addBookmark,
        updateBookmark,
        fetching,
      }}
    >
      {children}
    </BookmarksContext.Provider>
  );
}
