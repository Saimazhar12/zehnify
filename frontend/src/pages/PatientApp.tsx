import React, { useState } from 'react';
import {
  Heart, LogOut, ArrowLeft, Shield, HelpCircle
} from 'lucide-react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import GuideModal from '../components/GuideModal';
import NotificationBell from '../components/NotificationBell';
import { PATIENT_GUIDE_STEPS, PATIENT_GUIDE_TITLE } from '../content/patientGuide';


interface PatientAppProps {
  handleLogout: () => void;
}

const PatientApp: React.FC<PatientAppProps> = ({ handleLogout }) => {
  const { currentUser } = useAppContext();
  const location = useLocation();
  const isDashboard = location.pathname === '/app' || location.pathname === '/app/';
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="flex min-h-dvh h-dvh bg-slate-50 font-sans text-gray-800">
      <GuideModal
        open={showGuide}
        onClose={() => setShowGuide(false)}
        title={PATIENT_GUIDE_TITLE}
        subtitle="Your step-by-step walkthrough of the Zehnify treatment journey."
        steps={PATIENT_GUIDE_STEPS}
      />

      <main className="w-full h-full overflow-y-auto bg-slate-50/50">
        <div className="max-w-7xl mx-auto min-h-full p-4 sm:p-6 md:p-10 flex flex-col">

          <div className="flex items-center justify-between mb-6 sm:mb-8 gap-2">
            {isDashboard ? (
              <>
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 truncate">Zehnify</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                  <NotificationBell />
                  <button
                    type="button"
                    onClick={() => setShowGuide(true)}
                    className="flex items-center justify-center space-x-2 text-blue-600 font-bold bg-blue-50 min-h-11 min-w-11 px-3 sm:px-4 py-2 rounded-full hover:bg-blue-100 transition-all border border-blue-100"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Guide</span>
                  </button>
                  {currentUser?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center justify-center space-x-2 text-purple-600 font-bold bg-purple-50 min-h-11 min-w-11 px-3 sm:px-4 py-2 rounded-full hover:bg-purple-100 transition-all border border-purple-100"
                    >
                      <Shield className="w-4 h-4" />
                      <span className="hidden md:inline">Admin Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-2 text-red-500 font-medium hover:bg-red-50 min-h-11 min-w-11 px-3 sm:px-4 py-2 rounded-full transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between w-full gap-2 sm:gap-4 min-w-0">
                <Link
                  to="/app"
                  className="group flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors min-w-0"
                >
                  <div className="p-2.5 min-w-11 min-h-11 flex items-center justify-center bg-white rounded-full border border-gray-200 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all shrink-0">
                    <ArrowLeft className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-base sm:text-lg truncate">
                    <span className="sm:hidden">Home</span>
                    <span className="hidden sm:inline">Back to Home</span>
                  </span>
                </Link>
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <NotificationBell />
                  <button
                    type="button"
                    onClick={() => setShowGuide(true)}
                    className="flex items-center justify-center gap-2 text-blue-600 font-bold bg-blue-50 min-h-11 min-w-11 px-3 py-2 rounded-full hover:bg-blue-100 border border-blue-100 text-sm"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Guide</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <Outlet />

        </div>
      </main>
    </div>
  );
};

export default PatientApp;
