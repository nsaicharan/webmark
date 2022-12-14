import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../utils/firebase';
import { signInWithGoogle } from './../utils/firebase';
import { useRouter } from 'next/router';
import Spinner from './Spinner';

function Header() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  async function handleAuth() {
    if (user) {
      await router.push('/');
      auth.signOut();
    } else {
      signInWithGoogle();
    }
  }

  return (
    <header className="py-3 shadow-sm border-b border-slate-900/10">
      <nav className="max-w-7xl mx-auto px-5 flex justify-between items-center">
        <Link href="/" className="text-2xl text-slate-900">
          Webmark
        </Link>

        <div className="flex gap-4 md:gap-5">
          {user && router.pathname !== '/add' && (
            <Link
              href="/add"
              className="py-2 px-3 rounded text-sm text-white bg-indigo-600 outline-none focus:ring focus:ring-indigo-200 md:px-4 md:text-base"
            >
              Add <span className="sr-only md:not-sr-only">a bookmark</span>
            </Link>
          )}

          <button
            className="py-2 px-3 rounded text-sm text-indigo-600 border border-indigo-600 outline-none focus:ring focus:ring-indigo-200 md:px-4 md:text-base"
            onClick={handleAuth}
            disabled={loading}
          >
            {loading ? <Spinner /> : user ? 'Sign Out' : 'Sign In'}
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Header;
