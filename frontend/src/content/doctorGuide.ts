import { GuideStep } from '../components/GuideModal';

export const DOCTOR_GUIDE_TITLE = 'How to Use Zehnify (Doctor Guide)';

export const DOCTOR_GUIDE_STEPS: GuideStep[] = [
  {
    title: '1. Get doctor access',
    description:
      'Sign up as a patient first. An administrator must promote your account to Doctor in the Admin Panel. Then log in using the Doctor tab on the login page.',
  },
  {
    title: '2. Open the Clinical Portal',
    description:
      'After login you land on the doctor portal. Use Patient Records in the sidebar to browse all patients who have started treatment.',
  },
  {
    title: '3. Select a patient',
    description:
      'Click a patient to view their treatment detail: intake progress, assigned sections, AI usage, and mood analytics summaries from their chat sessions.',
  },
  {
    title: '4. Review intake & mood data',
    description:
      'Check whether intake is complete. Review Mood Analytics cards and open Full Mood Insights for session trends, happiness scores, and dominant emotions — this data is hidden from patients.',
  },
  {
    title: '5. Assign CBT sections',
    description:
      'When intake is complete and you are ready, click Assign Sections. Choose one or more CBT modules (Mood Awareness, Cognitive Restructuring, etc.) and assign them in the order patients should complete them.',
  },
  {
    title: '6. Generate clinical reports',
    description:
      'Generate an Initial Report after intake review, and a Final Report when all assigned sections are complete. Download PDFs for your records or university workflow.',
  },
  {
    title: '7. Publish wellness articles',
    description:
      'Go to Wellness Articles in the sidebar to write and publish educational content. Patients read these in their Wellness Library with your name as author.',
  },
  {
    title: '8. Admins can help too',
    description:
      'Administrators can also access the Clinical Portal to assign sections, review patients, and manage user roles. Coordinate with your admin for promotions and user management.',
  },
];
