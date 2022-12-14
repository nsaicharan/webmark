import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { auth } from '../../utils/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import Spinner from '../../components/Spinner';
import { signInWithGoogle } from './../../utils/firebase';
import Error from 'next/error';
import Link from 'next/link';
import { useBookmarks } from '../../contexts/BookmarksContext';

function Edit() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState({
    url: '',
    title: '',
    category: '',
    notes: '',
  });
  const [user, loading] = useAuthState(auth);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);

  const { bookmarks, existingCategories, updateBookmark, fetching } =
    useBookmarks();

  useEffect(() => {
    if (fetching) return;

    const bookmarkData = bookmarks.filter((b) => b.id === id);

    if (bookmarkData.length) {
      const { url, title, category, notes } = bookmarkData[0];
      setData({ url, title, category, notes });
    } else {
      setNotFound(true);
    }
  }, [fetching]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    await updateBookmark({ id, ...data });
    router.push('/');
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  }

  if (!loading && !user) {
    signInWithGoogle();
    return;
  }

  if (notFound) {
    return <Error statusCode={404} />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h1 className="mb-8 text-2xl text-slate-900 font-bold">Edit bookmark</h1>

      <form
        className="grid grid-cols-1 gap-6"
        autoFocus
        onSubmit={handleSubmit}
      >
        <label>
          <span className="text-gray-700">URL</span>
          <input
            type="url"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="https://example.com"
            name="url"
            value={data.url}
            onChange={handleChange}
          />
        </label>

        <label>
          <span className="text-gray-700">Title</span>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            name="title"
            value={data.title}
            onChange={handleChange}
          />
        </label>

        <label>
          <span className="text-gray-700">Category</span>
          <div className="relative">
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              name="category"
              autoComplete="off"
              list="categoriesList"
              value={data.category}
              onChange={handleChange}
            />
            <span className="absolute top-0.5 bottom-0.5 right-0.5 w-10 bg-white"></span>
          </div>
        </label>
        <datalist id="categoriesList">
          {Object.keys(existingCategories).map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>

        <label>
          <span className="text-gray-700">Additional Notes</span>
          <textarea
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            rows="2"
            name="notes"
            value={data.notes}
            onChange={handleChange}
          />
        </label>

        <div className="mt-1.5 flex gap-5">
          <button className="py-[9px] px-4 rounded bg-indigo-600 text-white text-center shadow-sm outline-none focus:ring focus:ring-indigo-200">
            {saving ? <Spinner /> : 'Save it'}
          </button>

          <Link
            href="/"
            className="py-2 px-4 rounded text-center text-indigo-600 border border-indigo-600 outline-none focus:ring focus:ring-indigo-200"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Edit;
