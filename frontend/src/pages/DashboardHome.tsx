import { useEffect, useState } from 'react';
import {
  MessageCircle, PenTool, Dumbbell, BookOpen,
  ArrowRight, ChevronRight, LayoutDashboard, Loader2, ClipboardList,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { treatmentService } from '../services/treatmentService';
import { TreatmentStatus } from '../types';
import { TREATMENT_STATUS_LABELS } from '../constants';
import DashboardNotifications from '../components/DashboardNotifications';

const DashboardHome: React.FC = () => {
  const { currentUser } = useAppContext();
  const navigate = useNavigate();
  const [status, setStatus] = useState<TreatmentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const firstName = currentUser?.firstName || 'Friend';

  useEffect(() => {
    const load = async () => {
      try {
        const data = await treatmentService.getStatus();
        setStatus(data);
      } catch (error) {
        console.error('Failed to load treatment status:', error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const intake = status?.intakeProgress;
  const intakePct = intake ? Math.round((intake.userMessages / intake.required) * 100) : 0;

  return (
    <div className="space-y-6 flex-1 animate-fade-in">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight break-words">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-gray-500 mt-3 text-base sm:text-lg">Your structured treatment hub.</p>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center gap-3 text-gray-500 py-8">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading treatment progress...</span>
        </div>
      ) : status && (
        <div className="bg-white rounded-[2rem] p-6 border border-gray-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
            <ClipboardList className="w-5 h-5 text-blue-600 shrink-0" />
            <h3 className="font-bold text-gray-900">Treatment Progress</h3>
            {status.status && (
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                {TREATMENT_STATUS_LABELS[status.status] ?? status.status}
              </span>
            )}
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
              <span>Overall completion</span>
              <span>{status.completionPercentage}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${status.completionPercentage}%` }}
              />
            </div>
          </div>

          {intake && !intake.complete && (
            <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm font-bold text-blue-900 mb-2">Intake Assessment</p>
              <div className="flex justify-between text-xs text-blue-700 mb-1">
                <span>{intake.userMessages} / {intake.required} messages</span>
                <span>{intakePct}%</span>
              </div>
              <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${intakePct}%` }} />
              </div>
            </div>
          )}

          {intake?.complete && status.assignments.length === 0 && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-4">
              Intake complete. Waiting for your doctor to review and assign therapeutic sections.
            </p>
          )}

          {status.assignments.length > 0 && (
            <div className="space-y-2">
              {status.assignments.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-2 text-sm py-2 border-b border-gray-50 last:border-0 min-w-0">
                  <span className="text-gray-700 font-medium truncate min-w-0">{a.sectionLabel}</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    a.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-600'
                      : a.status === 'in_progress'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-gray-100 text-gray-500'
                  }`}>
                    {a.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <DashboardNotifications />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 auto-rows-auto md:auto-rows-[180px]">
        <div
          onClick={() => navigate('/app/chat')}
          className="md:col-span-2 md:row-span-2 bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-gray-300 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between min-h-[180px]"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-700" />
          <div>
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/30">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Treatment Chat</h3>
            <p className="text-gray-500">Structured intake and CBT therapeutic sessions.</p>
          </div>
          <div className="relative z-10 flex items-center text-blue-600 font-bold group-hover:translate-x-2 transition-transform">
            Continue Session <ArrowRight className="ml-2 w-5 h-5" />
          </div>
        </div>

        {currentUser?.role === 'admin' && (
          <>
            <div
              onClick={() => navigate('/admin')}
              className="md:col-span-1 md:row-span-1 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-300 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Admin Panel</h3>
                <p className="text-xs text-gray-500">Manage users & reports</p>
              </div>
            </div>
            <div
              onClick={() => navigate('/doctor')}
              className="md:col-span-1 md:row-span-1 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-300 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center text-cyan-600">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Clinical Panel</h3>
                <p className="text-xs text-gray-500">Assign sections & review patients</p>
              </div>
            </div>
          </>
        )}

        <div
          onClick={() => navigate('/app/journal')}
          className="md:col-span-1 md:row-span-2 bg-gradient-to-b from-amber-50 to-white rounded-[2rem] p-6 shadow-sm border border-amber-100 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/30 mb-4">
            <PenTool className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">My Journal</h3>
            <p className="text-gray-500 text-sm mb-4">Write down your thoughts and track your journey.</p>
            <div className="bg-white/60 p-3 rounded-xl border border-amber-100">
              <p className="text-xs text-amber-800 font-medium italic">&quot;Today I feel...&quot;</p>
            </div>
          </div>
          <div className="flex items-center text-amber-600 font-bold text-sm mt-4">
            Write Note <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => navigate('/app/exercise')}
          className="md:col-span-1 md:row-span-1 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-300 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Move Body</h3>
            <p className="text-xs text-gray-500">Quick exercises</p>
          </div>
        </div>

        <div
          onClick={() => navigate('/app/resources')}
          className="md:col-span-2 md:row-span-1 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-300 hover:shadow-lg transition-all cursor-pointer flex items-center justify-between gap-4 px-4 sm:px-8"
        >
          <div>
            <h3 className="text-xl font-bold text-gray-900">Wellness Library</h3>
            <p className="text-sm text-gray-500">Articles, sounds & guides.</p>
          </div>
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
