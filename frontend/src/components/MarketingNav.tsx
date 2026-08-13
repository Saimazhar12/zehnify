import { useState } from 'react';
import { Heart, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const links = [
  { to: '/features', label: 'Features' },
  { to: '/doctors', label: 'For Doctors' },
  { to: '/about', label: 'About Us' },
] as const;

type MarketingNavProps = {
  active?: 'features' | 'doctors' | 'about';
};

const MarketingNav = ({ active }: MarketingNavProps) => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="relative max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center gap-3">
        <Link to="/" className="flex items-center space-x-2 shrink-0" onClick={() => setOpen(false)}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">Zehnify</span>
        </Link>

        <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-600">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={
                active && link.to.includes(active)
                  ? 'text-blue-600 font-semibold'
                  : 'hover:text-blue-600 transition-colors'
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/login"
            className="hidden sm:inline text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
          >
            Sign Up
          </Link>
          <button
            type="button"
            className="md:hidden min-w-11 min-h-11 p-2.5 inline-flex items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 z-50 mx-4 sm:mx-6 mt-2 rounded-2xl border border-gray-100 bg-white shadow-xl p-4 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`px-4 py-3 rounded-xl text-sm font-medium min-h-11 ${
                active && link.to.includes(active)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            className="sm:hidden px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 min-h-11"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
};

export default MarketingNav;
