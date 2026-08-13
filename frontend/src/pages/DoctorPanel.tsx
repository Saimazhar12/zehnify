import { useState, useEffect } from 'react';
import {
  Users, FileText, Download, CheckCircle, Search, LogOut, Loader2,
  User as UserIcon, ChevronRight, X, Plus, ClipboardList, TrendingUp, Shield, BookOpen, HelpCircle, Menu, MessageSquare,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { doctorService } from '../services/doctorService';
import { reportService } from '../services/reportService';
import { moodService } from '../services/moodService';
import { DoctorPatient, PatientChatMoodSummary, PatientTreatmentDetail } from '../types';
import { ASSIGNABLE_SECTIONS, TREATMENT_STATUS_LABELS } from '../constants';
import AiUsageCard from '../components/AiUsageCard';
import GuideModal from '../components/GuideModal';
import { DOCTOR_GUIDE_STEPS, DOCTOR_GUIDE_TITLE } from '../content/doctorGuide';

export default function DoctorPanel() {
  const { handleLogout, currentUser } = useAppContext();
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<DoctorPatient | null>(null);
  const [patientDetail, setPatientDetail] = useState<PatientTreatmentDetail | null>(null);
  const [moodSummaries, setMoodSummaries] = useState<PatientChatMoodSummary[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSections, setSelectedSections] = useState<number[]>([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    void loadPatients();
  }, []);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await doctorService.getPatients();
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
      showToast('Failed to load patient records.');
    } finally {
      setLoading(false);
    }
  };

  const loadPatientDetail = async (patient: DoctorPatient) => {
    setSelectedPatient(patient);
    setDetailLoading(true);
    setMoodSummaries([]);
    try {
      const [detail, summaries] = await Promise.all([
        doctorService.getPatientTreatment(patient.id),
        moodService.getPatientMoodSummaries(patient.id).catch(() => []),
      ]);
      setPatientDetail(detail);
      setMoodSummaries(summaries);
    } catch (error) {
      console.error('Error loading patient detail:', error);
      showToast('Failed to load patient details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const refreshPatient = async (patientId: string) => {
    const data = await doctorService.getPatients();
    setPatients(data);
    const updated = data.find((p) => p.id === patientId);
    if (updated) {
      await loadPatientDetail(updated);
    }
  };

  const handleGenerateReport = async (patient: DoctorPatient, final = false) => {
    setGeneratingId(patient.id);
    try {
      if (final) {
        await reportService.generateFinalReport(patient.id);
        showToast(`Final report generated for ${patient.firstName}.`);
      } else {
        await reportService.generateReport(patient.id);
        showToast(`Initial report generated for ${patient.firstName}.`);
      }
      await refreshPatient(patient.id);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || 'Failed to generate report.');
    } finally {
      setGeneratingId(null);
    }
  };

  const handleDownloadPDF = async (patient: DoctorPatient, final = false) => {
    setDownloadingId(patient.id);
    try {
      const fileName = final
        ? `${patient.firstName}_${patient.lastName}_Final_Report.pdf`
        : `${patient.firstName}_${patient.lastName}_Report.pdf`;
      if (final) {
        await reportService.downloadFinalReport(patient.id, fileName);
      } else {
        await reportService.downloadReport(patient.id, fileName);
      }
      showToast('PDF downloaded successfully.');
    } catch (error) {
      showToast('Failed to download PDF report.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleAssignSections = async () => {
    if (!selectedPatient || selectedSections.length === 0) return;
    setAssigningId(selectedPatient.id);
    try {
      const sections = selectedSections.map((sectionType, index) => ({
        sectionType,
        sortOrder: index + 1,
      }));
      await doctorService.assignSections(selectedPatient.id, sections);
      showToast(`Sections assigned to ${selectedPatient.firstName}.`);
      setShowAssignModal(false);
      setSelectedSections([]);
      await refreshPatient(selectedPatient.id);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      showToast(err.response?.data?.message || 'Failed to assign sections.');
    } finally {
      setAssigningId(null);
    }
  };

  const openMessageModal = () => {
    setMessageTitle('');
    setMessageBody('');
    setShowMessageModal(true);
  };

  const handleSendMessage = async () => {
    if (!selectedPatient) return;
    const title = messageTitle.trim();
    const body = messageBody.trim();
    if (!title || !body) {
      showToast('Title and message are required.');
      return;
    }
    setSendingMessage(true);
    try {
      await doctorService.sendNotification(selectedPatient.id, { title, body });
      showToast(`Message sent to ${selectedPatient.firstName}.`);
      setShowMessageModal(false);
      setMessageTitle('');
      setMessageBody('');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string | string[] } } };
      const msg = err.response?.data?.message;
      showToast(
        Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to send message.',
      );
    } finally {
      setSendingMessage(false);
    }
  };

  const toggleSection = (sectionType: number) => {
    setSelectedSections((prev) =>
      prev.includes(sectionType)
        ? prev.filter((t) => t !== sectionType)
        : [...prev, sectionType],
    );
  };

  const filteredPatients = patients.filter(
    (p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sidebarContent = (
    <>
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 text-white">
            <UserIcon size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800 tracking-tight">
              {currentUser?.role === 'admin' ? 'Clinical Portal' : 'Doctor Portal'}
            </h1>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
              {currentUser?.firstName} {currentUser?.lastName}
            </p>
          </div>
        </div>
        {currentUser?.role === 'admin' && (
          <Link
            to="/admin"
            onClick={() => setSidebarOpen(false)}
            className="mb-4 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-purple-700 bg-purple-50 font-bold text-sm border border-purple-100 hover:bg-purple-100 transition-all"
          >
            <Shield size={18} />
            <span>Admin Panel</span>
          </Link>
        )}
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm shadow-sm border border-indigo-100">
          <Users size={18} />
          <span>Patient Records</span>
        </button>
        <Link
          to="/doctor/articles"
          onClick={() => setSidebarOpen(false)}
          className="mt-2 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 font-bold text-sm border border-slate-100 transition-all"
        >
          <BookOpen size={18} />
          <span>Wellness Articles</span>
        </Link>
      </div>
      <div className="mt-auto p-6 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all font-bold text-sm"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <GuideModal
        open={showGuide}
        onClose={() => setShowGuide(false)}
        title={DOCTOR_GUIDE_TITLE}
        subtitle="Everything you need to manage patients on Zehnify."
        steps={DOCTOR_GUIDE_STEPS}
      />
      {toast && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-5 z-50 bg-gray-900/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-fade-in border border-white/10">
          <CheckCircle size={16} className="text-emerald-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0">
            <UserIcon size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-slate-800 truncate">
              {currentUser?.role === 'admin' ? 'Clinical Portal' : 'Doctor Portal'}
            </p>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest truncate">
              {currentUser?.firstName} {currentUser?.lastName}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-end p-4 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-500"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col shadow-sm shrink-0">
        {sidebarContent}
      </aside>

      <div className="flex-1 p-4 sm:p-6 md:p-12 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Management</h2>
              <p className="text-slate-500 mt-2 text-sm font-medium">
                Review intake, assign CBT sections, and generate clinical reports.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setShowGuide(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm border border-indigo-100 hover:bg-indigo-100 transition-all w-full sm:w-auto"
              >
                <HelpCircle size={18} />
                Guide
              </button>
              <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Find a patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm font-medium shadow-sm"
              />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {loading ? (
                <div className="flex flex-col items-center py-16 bg-white rounded-[2rem] border border-slate-100">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                  <p className="text-slate-500 text-sm font-bold">Loading patients...</p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-100">
                  <Users size={32} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-800 font-bold">No patients found</p>
                </div>
              ) : (
                filteredPatients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => void loadPatientDetail(patient)}
                    className={`w-full text-left bg-white p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      selectedPatient?.id === patient.id
                        ? 'border-indigo-300 shadow-lg shadow-indigo-500/10'
                        : 'border-slate-200 hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-600 shrink-0">
                        {patient.firstName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{patient.firstName} {patient.lastName}</p>
                        <p className="text-[10px] text-slate-400 truncate">{patient.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-black text-indigo-600">{patient.completionPercentage}%</span>
                      <ChevronRight size={16} className="text-slate-300" />
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="lg:col-span-3">
              {!selectedPatient ? (
                <div className="bg-white rounded-[2rem] border border-slate-100 p-12 text-center">
                  <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">Select a patient to view treatment details</p>
                </div>
              ) : detailLoading ? (
                <div className="bg-white rounded-[2rem] border border-slate-100 p-12 flex flex-col items-center">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                  <p className="text-slate-500 text-sm">Loading details...</p>
                </div>
              ) : patientDetail && (
                <div className="bg-white rounded-[2rem] border border-slate-200 p-6 md:p-8 space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">
                      {patientDetail.patient.firstName} {patientDetail.patient.lastName}
                    </h3>
                    <p className="text-sm text-slate-500">{patientDetail.patient.email}</p>
                    {patientDetail.plan?.status && (
                      <span className="inline-block mt-2 text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
                        {TREATMENT_STATUS_LABELS[patientDetail.plan.status] ?? patientDetail.plan.status}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                      <span>Completion</span>
                      <span>{patientDetail.completionPercentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${patientDetail.completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  {patientDetail.intakeProgress && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-sm font-bold text-slate-800 mb-1">Intake Assessment</p>
                      <p className="text-xs text-slate-500">
                        {patientDetail.intakeProgress.userMessages} / {patientDetail.intakeProgress.required} messages
                        {patientDetail.intakeProgress.complete ? ' — Complete' : ' — In progress'}
                      </p>
                    </div>
                  )}

                  {patientDetail.assignments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-slate-800">Assigned Sections</p>
                      {patientDetail.assignments.map((a) => (
                        <div key={a.id} className="flex justify-between text-sm py-2 border-b border-slate-50">
                          <span>{a.sectionLabel}</span>
                          <span className="text-[10px] font-black uppercase text-slate-500">{a.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {patientDetail.aiUsage && (
                    <AiUsageCard usage={patientDetail.aiUsage} compact />
                  )}

                  {moodSummaries.length > 0 && (
                    <div className="p-4 bg-violet-50 rounded-xl border border-violet-100 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-slate-800">Mood Analytics</p>
                        <Link
                          to={`/doctor/insights/${selectedPatient.id}`}
                          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-violet-700 hover:text-violet-900"
                        >
                          <TrendingUp size={12} />
                          Full insights
                        </Link>
                      </div>
                      {moodSummaries.map((summary) => (
                        <div key={summary.chatId} className="text-xs text-slate-600 border-t border-violet-100 pt-2 first:border-t-0 first:pt-0">
                          <p className="font-semibold text-slate-800">{summary.chatTitle}</p>
                          <p>
                            Dominant:{' '}
                            <span className="font-bold text-violet-700 capitalize">
                              {summary.dominantEmotion ?? 'N/A'}
                            </span>
                            {' · '}
                            {summary.acceptedCount}/{summary.scansLimit} scans
                            {summary.averageConfidence !== null && (
                              <> · {Math.round(summary.averageConfidence * 100)}% avg confidence</>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {moodSummaries.length === 0 && selectedPatient && (
                    <Link
                      to={`/doctor/insights/${selectedPatient.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-violet-50 text-violet-700 border border-violet-100 hover:bg-violet-100 transition-all"
                    >
                      <TrendingUp size={14} />
                      View mood insights
                    </Link>
                  )}

                  <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
                    <button
                      onClick={openMessageModal}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <MessageSquare size={14} />
                      Send Message
                    </button>

                    {selectedPatient.reportGeneratable && !selectedPatient.hasInitialReport && (
                      <button
                        onClick={() => void handleGenerateReport(selectedPatient)}
                        disabled={generatingId === selectedPatient.id}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase bg-slate-900 text-white hover:bg-indigo-600 disabled:opacity-50"
                      >
                        {generatingId === selectedPatient.id ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                        Generate Initial Report
                      </button>
                    )}

                    {selectedPatient.hasInitialReport && (
                      <button
                        onClick={() => void handleDownloadPDF(selectedPatient)}
                        disabled={downloadingId === selectedPatient.id}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {downloadingId === selectedPatient.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                        Download Initial PDF
                      </button>
                    )}

                    {selectedPatient.hasInitialReport && selectedPatient.sectionsAssigned === 0 && (
                      <button
                        onClick={() => { setShowAssignModal(true); setSelectedSections([]); }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <Plus size={14} />
                        Assign Sections
                      </button>
                    )}

                    {selectedPatient.finalReportGeneratable && (
                      <>
                        <button
                          onClick={() => void handleGenerateReport(selectedPatient, true)}
                          disabled={generatingId === selectedPatient.id}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                        >
                          {generatingId === selectedPatient.id ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                          Generate Final Report
                        </button>
                        <button
                          onClick={() => void handleDownloadPDF(selectedPatient, true)}
                          disabled={downloadingId === selectedPatient.id}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase border border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-50"
                        >
                          <Download size={14} />
                          Download Final PDF
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAssignModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900">Assign CBT Sections</h3>
              <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Select sections for {selectedPatient.firstName}. Order follows selection order.
            </p>
            <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
              {ASSIGNABLE_SECTIONS.map((section) => (
                <label
                  key={section.sectionType}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedSections.includes(section.sectionType)
                      ? 'border-indigo-300 bg-indigo-50'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSections.includes(section.sectionType)}
                    onChange={() => toggleSection(section.sectionType)}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                  <span className="text-sm font-medium text-slate-800">{section.sectionLabel}</span>
                </label>
              ))}
            </div>
            <button
              onClick={() => void handleAssignSections()}
              disabled={selectedSections.length === 0 || assigningId === selectedPatient.id}
              className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {assigningId === selectedPatient.id ? <Loader2 size={16} className="animate-spin" /> : null}
              Assign {selectedSections.length} Section{selectedSections.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {showMessageModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <div className="bg-white rounded-t-[2rem] sm:rounded-[2rem] p-6 md:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-slate-900">Send Message</h3>
              <button
                type="button"
                onClick={() => setShowMessageModal(false)}
                className="p-2 min-h-11 min-w-11 flex items-center justify-center hover:bg-slate-100 rounded-xl"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Message will appear on {selectedPatient.firstName}&apos;s dashboard as a notification.
            </p>
            <label className="block mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Title</span>
              <input
                type="text"
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
                maxLength={200}
                placeholder="e.g. Check-in reminder"
                className="mt-1.5 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </label>
            <label className="block mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Message</span>
              <textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                maxLength={2000}
                rows={5}
                placeholder="Write your message to the patient…"
                className="mt-1.5 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm resize-y min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </label>
            <button
              type="button"
              onClick={() => void handleSendMessage()}
              disabled={sendingMessage || !messageTitle.trim() || !messageBody.trim()}
              className="w-full py-3 min-h-12 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sendingMessage ? <Loader2 size={16} className="animate-spin" /> : <MessageSquare size={16} />}
              Send Notification
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
