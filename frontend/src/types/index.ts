import { LucideIcon } from 'lucide-react';

export interface Mood {
  label: string;
  color: string;
  icon: LucideIcon;
}

export interface ChatMode {
  id: string;
  title: string;
  icon: LucideIcon;
  desc: string;
  color: string;
  prompt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp?: string;
}

export interface Chat {
  id: string;
  type: number;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: number;
  name: string;
  status: string;
  lastCheck: string;
  risk: 'Low' | 'Medium' | 'High';
}

export interface Exercise {
  id: number;
  title: string;
  duration: string;
  color: string;
  description: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'doctor' | 'admin';
  dateOfBirth?: string;
  createdAt?: string;
  reportGeneratable?: boolean;
  aiUsage?: AiUsageSummary;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export type TreatmentPlanStatus =
  | 'intake_in_progress'
  | 'intake_complete'
  | 'sections_assigned'
  | 'sections_in_progress'
  | 'sections_complete'
  | 'closed'
  | null;

export type SectionAssignmentStatus = 'assigned' | 'in_progress' | 'completed';

export interface SectionAssignment {
  id: string;
  sectionType: number;
  sectionLabel: string;
  status: SectionAssignmentStatus;
  sortOrder: number;
  doctorNotes: string | null;
  chatId: string | null;
  requiredUserMessages: number;
}

export interface TreatmentStatus {
  hasActivePlan: boolean;
  planId?: string;
  status: TreatmentPlanStatus;
  intakeProgress: {
    chatId: string | null;
    userMessages: number;
    required: number;
    complete: boolean;
  } | null;
  assignments: SectionAssignment[];
  completionPercentage: number;
  reportGeneratable: boolean;
  hasInitialReport: boolean;
  finalReportGeneratable: boolean;
}

export interface DoctorPatient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  createdAt?: string;
  treatmentStatus: TreatmentPlanStatus;
  intakeComplete: boolean;
  reportGeneratable: boolean;
  hasInitialReport: boolean;
  sectionsAssigned: number;
  sectionsComplete: number;
  finalReportGeneratable: boolean;
  completionPercentage: number;
  aiUsage?: AiUsageSummary;
}

export interface PatientTreatmentDetail {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth?: string;
  };
  plan: {
    id: string;
    status: TreatmentPlanStatus;
    doctorId: string | null;
    createdAt: string;
  } | null;
  intakeProgress: TreatmentStatus['intakeProgress'];
  assignments: SectionAssignment[];
  reports: Array<{
    id: string;
    reportType: string;
    generatedAt: string;
    doctorId: string;
  }>;
  reportGeneratable: boolean;
  hasInitialReport: boolean;
  finalReportGeneratable: boolean;
  completionPercentage: number;
  aiUsage?: AiUsageSummary;
}

export interface AssignableSection {
  sectionType: number;
  sectionLabel: string;
}

export interface AiUsageTokens {
  input: number;
  output: number;
}

export interface AiUsageCosts {
  input: number;
  output: number;
  total: number;
}

export interface AiUsageRates {
  inputPerMTok: number;
  outputPerMTok: number;
}

export interface AiUsageSummary {
  tokens: AiUsageTokens;
  costs: AiUsageCosts;
  rates: AiUsageRates;
}

export interface EmotionSnapshot {
  id: string;
  chatId: string;
  accepted: boolean;
  reason: string;
  prediction: string | null;
  confidence: number | null;
  allEmotions: Record<string, number> | null;
  sequenceNumber: number | null;
  createdAt: string;
}

export interface MoodSummary {
  acceptedCount: number;
  totalAttempts: number;
  scansLimit: number;
  dominantEmotion: string | null;
  averageConfidence: number | null;
  emotionDistribution: Record<string, number>;
  averageEmotions: Record<string, number>;
  latestSnapshot: EmotionSnapshot | null;
}

export interface PatientChatMoodSummary extends MoodSummary {
  chatId: string;
  chatType: number;
  chatTitle: string;
  chatStatus: string;
}

export interface MoodAnalyzeResult {
  capped: boolean;
  cooldown?: boolean;
  retryAfterMs?: number;
  scansUsed: number;
  scansLimit: number;
  snapshot: EmotionSnapshot | null;
}

export interface MoodTimelinePoint {
  scan: number;
  label: string;
  prediction: string | null;
  confidence: number;
  happiness: number | null;
  neutral: number | null;
  sad: number | null;
  angry: number | null;
  createdAt: string;
}

export interface MoodSessionInsight {
  chatId: string;
  chatTitle: string;
  chatType: number;
  chatStatus: string;
  startedAt: string;
  dominantEmotion: string | null;
  happinessScore: number;
  averageConfidence: number | null;
  acceptedCount: number;
  emotionDistribution: Record<string, number>;
  averageEmotions: Record<string, number>;
  timeline: MoodTimelinePoint[];
}

export interface MoodInsights {
  overall: {
    totalScans: number;
    totalSessions: number;
    dominantEmotion: string | null;
    happinessScore: number;
    averageConfidence: number | null;
    emotionDistribution: Record<string, number>;
  };
  sessions: MoodSessionInsight[];
}


export interface Report {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  generatedAt: string;
  date: string;
  messages: ChatMessage[];
  moodScan: string | null;
  summary: string;
  reviewed: boolean;
}

export type AppView = 'landing' | 'login' | 'signup' | 'app' | 'doctor' | 'admin';
export type PatientTab = 'dashboard' | 'chat' | 'journal' | 'exercise' | 'insights' | 'scan' | 'resources' | 'stats' | 'admin';
export type UserRole = 'user' | 'doctor' | 'admin' | null;

export type WellnessArticleType = 'article' | 'guide';

export interface ArticleAuthor {
  id: string;
  firstName: string;
  lastName: string;
}

export interface WellnessArticleSummary {
  id: string;
  title: string;
  excerpt: string;
  type: WellnessArticleType;
  readTimeMinutes: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author: ArticleAuthor | null;
}

export interface WellnessArticleDetail extends WellnessArticleSummary {
  content: string;
}

export type NotificationType = 'section_assigned' | 'custom_message';

export interface NotificationSender {
  id: string;
  firstName?: string;
  lastName?: string;
  role?: 'user' | 'doctor' | 'admin';
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  sender: NotificationSender | null;
}
