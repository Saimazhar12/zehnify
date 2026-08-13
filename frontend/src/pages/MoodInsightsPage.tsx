import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Brain, Loader2, Smile, Sparkles, TrendingUp, Activity, BarChart3, ArrowLeft,
} from 'lucide-react';
import { moodService } from '../services/moodService';
import { MoodInsights, MoodSessionInsight } from '../types';
import { EMOTION_CHART_COLORS } from '../constants';

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function emotionColor(emotion: string): string {
  return EMOTION_CHART_COLORS[emotion.toLowerCase()] ?? '#6366f1';
}

export default function MoodInsightsPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [insights, setInsights] = useState<MoodInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const update = () => setIsNarrow(window.innerWidth < 640);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (!patientId) return;

    const load = async () => {
      try {
        const data = await moodService.getPatientInsights(patientId);
        setInsights(data);
        if (data.sessions.length > 0) {
          setSelectedSessionId(data.sessions[data.sessions.length - 1].chatId);
        }
      } catch (error) {
        console.error('Failed to load mood insights:', error);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [patientId]);

  const selectedSession: MoodSessionInsight | null = useMemo(() => {
    if (!insights || !selectedSessionId) return null;
    return insights.sessions.find((s) => s.chatId === selectedSessionId) ?? null;
  }, [insights, selectedSessionId]);

  const overallPieData = useMemo(() => {
    if (!insights) return [];
    return Object.entries(insights.overall.emotionDistribution).map(([name, value]) => ({
      name: capitalize(name),
      value,
      fill: emotionColor(name),
    }));
  }, [insights]);

  const sessionBarData = useMemo(() => {
    if (!selectedSession) return [];
    return Object.entries(selectedSession.averageEmotions).map(([name, value]) => ({
      emotion: capitalize(name),
      score: Math.round(value * 100),
      fill: emotionColor(name),
    }));
  }, [selectedSession]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10">
        <div className="flex flex-col items-center justify-center py-24 text-gray-500 p-6 md:p-10">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-3" />
          <p className="text-sm font-medium">Loading patient mood insights...</p>
        </div>
      </div>
    );
  }

  if (!insights || insights.sessions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10">
        <div className="bg-white rounded-[2rem] border border-gray-200 p-6 md:p-10 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8 text-violet-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No mood data yet</h2>
          <p className="text-gray-500 text-sm">
            No mood scan data for this patient yet. Insights appear after treatment chats with camera enabled.
          </p>
        </div>
      </div>
    );
  }

  const { overall } = insights;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-8">
      <Link
        to="/doctor"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-violet-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to clinical panel
      </Link>
      <header>
        <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Mood Insights
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
          Patient emotional journey
        </h1>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Mood trends captured during each treatment session.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <StatCard
          icon={<Smile className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />}
          label="Happiness level"
          value={`${overall.happinessScore}%`}
          hint="Average happy expression score"
          accent="bg-emerald-50"
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />}
          label="Dominant mood"
          value={overall.dominantEmotion ? capitalize(overall.dominantEmotion) : 'N/A'}
          hint="Most frequent detected emotion"
          accent="bg-violet-50"
        />
        <StatCard
          icon={<Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />}
          label="Mood scans"
          value={String(overall.totalScans)}
          hint={`Across ${overall.totalSessions} session${overall.totalSessions !== 1 ? 's' : ''}`}
          accent="bg-blue-50"
        />
        <StatCard
          icon={<BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />}
          label="Avg confidence"
          value={overall.averageConfidence != null ? `${overall.averageConfidence}%` : 'N/A'}
          hint="Detection certainty"
          accent="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-[2rem] border border-gray-200 p-4 sm:p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-1">Happiness trend per session</h3>
          <p className="text-xs text-gray-500 mb-4">How your happy expression changed scan by scan</p>
          {selectedSession && selectedSession.timeline.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selectedSession.timeline}>
                  <defs>
                    <linearGradient id="happyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" unit="%" width={isNarrow ? 36 : 45} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="happiness"
                    name="happiness"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#happyGradient)"
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="confidence"
                    name="confidence"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-16 text-center">No timeline data for this session.</p>
          )}
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-200 p-4 sm:p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-1">Overall mood mix</h3>
          <p className="text-xs text-gray-500 mb-4">Share of each detected emotion</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overallPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {overallPieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-200 p-4 sm:p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Sessions</h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {insights.sessions.map((session) => (
            <button
              key={session.chatId}
              type="button"
              onClick={() => setSelectedSessionId(session.chatId)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border max-w-full truncate ${
                selectedSessionId === session.chatId
                  ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-600/20'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-violet-200'
              }`}
            >
              {session.chatTitle}
            </button>
          ))}
        </div>

        {selectedSession && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-3">
              <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100">
                <p className="text-[10px] font-bold uppercase text-violet-600 tracking-wider">Session dominant</p>
                <p className="text-xl font-black text-violet-900 mt-1">
                  {selectedSession.dominantEmotion ? capitalize(selectedSession.dominantEmotion) : 'N/A'}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <p className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Happiness</p>
                <p className="text-xl font-black text-emerald-900 mt-1">{selectedSession.happinessScore}%</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                <p><span className="font-bold text-slate-800">Scans:</span> {selectedSession.acceptedCount}</p>
                <p><span className="font-bold text-slate-800">Started:</span> {formatDate(selectedSession.startedAt)}</p>
                <p><span className="font-bold text-slate-800">Status:</span> {selectedSession.chatStatus}</p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <p className="text-xs text-gray-500 mb-3">Average emotion scores this session</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionBarData} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                    <YAxis type="category" dataKey="emotion" tick={{ fontSize: 11 }} width={isNarrow ? 52 : 70} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                      {sessionBarData.map((entry) => (
                        <Cell key={entry.emotion} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-5 shadow-sm min-w-0">
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-2 sm:mb-3 ${accent}`}>
        {icon}
      </div>
      <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400 truncate">{label}</p>
      <p className="text-lg sm:text-2xl font-black text-gray-900 mt-1 truncate">{value}</p>
      <p className="text-[10px] sm:text-[11px] text-gray-500 mt-1 line-clamp-2">{hint}</p>
    </div>
  );
}
