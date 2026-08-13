import { Smile, Frown, Meh, AlertCircle, MessageCircle } from 'lucide-react';
import { Mood, ChatMode, Exercise } from '../types';

export const INTAKE_USER_MESSAGE_LIMIT = 15;
export const SECTION_USER_MESSAGE_LIMIT = 20;

/** Must match backend USER_INPUT_MAX_LENGTH */
export const USER_INPUT_MAX_LENGTH = 200;

export const INTAKE_COMPLETE_BANNER =
  'Your intake is complete. A doctor will review your assessment. In 24 hours your report will be generated and shared with you.';

export const EMOTION_CHART_COLORS: Record<string, string> = {
  happy: '#10b981',
  sad: '#64748b',
  angry: '#ef4444',
  neutral: '#94a3b8',
  fear: '#f59e0b',
  surprise: '#8b5cf6',
  disgust: '#84cc16',
};

export const MOODS: Mood[] = [
  { label: 'Happy', color: 'bg-emerald-500', icon: Smile },
  { label: 'Calm', color: 'bg-blue-400', icon: Meh },
  { label: 'Anxious', color: 'bg-amber-400', icon: AlertCircle },
  { label: 'Sad', color: 'bg-slate-400', icon: Frown },
];

export const CHAT_MODES: ChatMode[] = [
  {
    id: 'vent',
    title: 'Just Vent',
    icon: MessageCircle,
    desc: 'A safe space to let it out. No judgment.',
    color: 'bg-rose-100 text-rose-600',
    prompt: "I'm here to listen. No judgment, just let it all out. What's frustrating you right now?",
  },
  // {
  //   id: 'calm',
  //   title: 'Calm Down',
  //   icon: Heart,
  //   desc: 'Breathing & grounding help for anxiety.',
  //   color: 'bg-blue-100 text-blue-600',
  //   prompt: "Take a deep breath with me. In... and Out... I'm here to help you find your center. Shall we try a quick grounding exercise?",
  // },
  // {
  //   id: 'reflect',
  //   title: 'Reflect',
  //   icon: Brain,
  //   desc: 'Deep questions to process thoughts.',
  //   color: 'bg-purple-100 text-purple-600',
  //   prompt: "Let's unpack things. What is the main thought occupying your mind today, and how does it serve you?",
  // },
  // {
  //   id: 'casual',
  //   title: 'Casual Chat',
  //   icon: Coffee,
  //   desc: 'Light conversation to distract & relax.',
  //   color: 'bg-amber-100 text-amber-600',
  //   prompt: "Hey! Sometimes we just need a distraction. Tell me, what's a small thing that made you smile recently?",
  // },
];

export const ASSIGNABLE_SECTIONS = [
  { sectionType: 2, sectionLabel: 'Mood & Emotional Awareness' },
  { sectionType: 3, sectionLabel: 'Cognitive Restructuring' },
  { sectionType: 4, sectionLabel: 'Behavioral Activation' },
  { sectionType: 5, sectionLabel: 'Coping & Stress Management' },
  { sectionType: 6, sectionLabel: 'Relapse Prevention & Goals' },
];

export const TREATMENT_STATUS_LABELS: Record<string, string> = {
  intake_in_progress: 'Intake In Progress',
  intake_complete: 'Intake Complete',
  sections_assigned: 'Sections Assigned',
  sections_in_progress: 'Sections In Progress',
  sections_complete: 'All Sections Complete',
  closed: 'Closed',
};

export const INITIAL_CHATS: [] = [];

export const EXERCISES: Exercise[] = [
  {
    id: 1,
    title: 'Deep Breathing',
    duration: '5 min',
    color: 'bg-blue-100 text-blue-700',
    description:
      'A calming technique to reduce stress and anxiety. Inhale deeply through your nose for 4 counts, hold for 4 counts, and exhale slowly through your mouth for 4 counts. Repeat to lower your heart rate and center your mind.',
  },
  {
    id: 2,
    title: 'Desk Stretch',
    duration: '3 min',
    color: 'bg-orange-100 text-orange-700',
    description:
      'Relieve tension in your neck, shoulders, and wrists caused by prolonged sitting. This quick sequence includes neck rolls, shoulder shrugs, and seated spinal twists to improve circulation and energy.',
  },
  {
    id: 3,
    title: 'Mindful Walking',
    duration: '15 min',
    color: 'bg-emerald-100 text-emerald-700',
    description:
      'Disconnect from screens and reconnect with your surroundings. Walk at a natural pace, noticing the sensation of your feet touching the ground, the rhythm of your breath, and the sounds around you.',
  },
  {
    id: 4,
    title: 'Neck Release',
    duration: '2 min',
    color: 'bg-purple-100 text-purple-700',
    description:
      'Gently tilt your head to one side, bringing your ear toward your shoulder. Breathe into the stretch for 30 seconds, then switch sides. This helps alleviate tension headaches and upper back stiffness.',
  },
];
