import { User, Report, ChatMessage } from '../types';

const KEYS = {
  USERS: 'zehnify_users',
  REPORTS: 'zehnify_reports',
  CURRENT_USER: 'zehnify_currentUser',
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const getUsers = (): User[] => {
  const raw = localStorage.getItem(KEYS.USERS);
  return raw ? JSON.parse(raw) : [];
};

export const saveUsers = (users: User[]): void => {
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
};

export const addUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
};

export const updateUser = (id: string, updates: Partial<User>): void => {
  const users = getUsers().map(u => u.id === id ? { ...u, ...updates } : u);
  saveUsers(users);
};

export const deleteUser = (id: string): void => {
  const users = getUsers().filter(u => u.id !== id);
  saveUsers(users);
};

export const getUserByEmail = (email: string): User | undefined => {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
};

// ── Current Session ───────────────────────────────────────────────────────────

export const getCurrentUser = (): User | null => {
  const raw = localStorage.getItem(KEYS.CURRENT_USER);
  return raw ? JSON.parse(raw) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEYS.CURRENT_USER);
  }
};

// ── Reports ───────────────────────────────────────────────────────────────────

export const getReports = (): Report[] => {
  const raw = localStorage.getItem(KEYS.REPORTS);
  return raw ? JSON.parse(raw) : [];
};

export const saveReports = (reports: Report[]): void => {
  localStorage.setItem(KEYS.REPORTS, JSON.stringify(reports));
};

export const addReport = (report: Report): void => {
  const reports = getReports();
  // Remove existing report for same user on same date
  const filtered = reports.filter(r => !(r.userId === report.userId && r.date === report.date));
  filtered.push(report);
  saveReports(filtered);
};

export const getReportsByUser = (userId: string): Report[] => {
  return getReports().filter(r => r.userId === userId);
};

export const markReportReviewed = (reportId: string): void => {
  const reports = getReports().map(r => r.id === reportId ? { ...r, reviewed: true } : r);
  saveReports(reports);
};

export const deleteReport = (reportId: string): void => {
  const reports = getReports().filter(r => r.id !== reportId);
  saveReports(reports);
};

// ── Report Generator ──────────────────────────────────────────────────────────

export const generateReport = (
  user: User,
  messages: ChatMessage[],
  moodScan: string | null
): Report => {
  const today = new Date().toLocaleDateString();
  const summary = buildSummary(messages, moodScan);

  const report: Report = {
    id: `report_${Date.now()}`,
    userId: user.id,
    userName: `${user.firstName} ${user.lastName}`,
    userEmail: user.email,
    generatedAt: new Date().toISOString(),
    date: today,
    messages,
    moodScan,
    summary,
    reviewed: false,
  };

  addReport(report);
  return report;
};

const buildSummary = (messages: ChatMessage[], moodScan: string | null): string => {
  const userMsgs = messages.filter(m => m.sender === 'user');
  if (userMsgs.length === 0 && !moodScan) {
    return 'No significant activity recorded today.';
  }
  const msgCount = userMsgs.length;
  const mood = moodScan ? `Mood scan detected: ${moodScan}.` : '';
  const topics: string[] = [];
  const allText = userMsgs.map(m => m.content.toLowerCase()).join(' ');
  if (allText.includes('anxious') || allText.includes('anxiety')) topics.push('anxiety');
  if (allText.includes('sad') || allText.includes('depress')) topics.push('low mood');
  if (allText.includes('stress') || allText.includes('work')) topics.push('work stress');
  if (allText.includes('sleep') || allText.includes('tired')) topics.push('sleep issues');
  if (allText.includes('family') || allText.includes('relation')) topics.push('relationships');

  const topicStr = topics.length > 0 ? `Topics discussed: ${topics.join(', ')}.` : '';
  return `Patient engaged in ${msgCount} message(s) with the AI companion today. ${mood} ${topicStr}`.trim();
};



// ── Admin ─────────────────────────────────────────────────────────────────────

export const ADMIN_CREDENTIALS = {
  email: 'admin@zehnify.com',
  password: 'admin123',
};
