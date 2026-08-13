import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const MarketingFooter = () => (
  <footer className="bg-white py-12 border-t border-gray-100">
    <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-4 md:flex-row md:justify-between md:gap-6">
      <Link to="/" className="flex items-center space-x-2">
        <Heart className="w-5 h-5 text-blue-500" />
        <span className="font-bold text-gray-900">Zehnify</span>
      </Link>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
        <Link to="/features" className="hover:text-blue-600">Features</Link>
        <Link to="/doctors" className="hover:text-blue-600">For Doctors</Link>
        <Link to="/about" className="hover:text-blue-600">About Us</Link>
      </div>
      <p className="text-sm text-gray-400 text-center">© 2026 Zehnify Health Inc. All rights reserved.</p>
    </div>
  </footer>
);

export default MarketingFooter;
