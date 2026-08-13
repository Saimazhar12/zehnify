import { GuideStep } from '../components/GuideModal';

export const PATIENT_GUIDE_TITLE = 'How to Use Zehnify (Patient Guide)';

export const PATIENT_GUIDE_STEPS: GuideStep[] = [
  {
    title: '1. Create your account',
    description:
      'Sign up with your @umt.edu.pk email, accept the Terms & Conditions, and log in on the Patient tab. Doctor accounts are assigned by an admin — you always start as a patient.',
  },
  {
    title: '2. Explore your dashboard',
    description:
      'Your home screen shows treatment progress, intake status, and assigned CBT sections. Use the cards to open Treatment Chat, Journal, Exercises, and the Wellness Library.',
  },
  {
    title: '3. Complete the intake assessment',
    description:
      'Open Treatment Chat and begin the Intake Assessment. Answer the AI guide honestly about how you have been feeling. Complete all required messages in this phase.',
  },
  {
    title: '4. Enable your camera during chat',
    description:
      'When prompted, allow camera access for wellness scanning. You will only see scanner status (e.g. Scanning, No face, Active) — detected moods are reviewed by your doctor, not shown to you.',
  },
  {
    title: '5. Wait for doctor review',
    description:
      'After intake is complete, your status changes to waiting for doctor review. A clinician will read your assessment and may generate an initial report within about 24 hours.',
  },
  {
    title: '6. Complete assigned CBT sections',
    description:
      'Your doctor will assign therapeutic sections (e.g. Mood Awareness, Cognitive Restructuring). Sections unlock in order — finish each chat session before moving to the next.',
  },
  {
    title: '7. Use supporting tools',
    description:
      'Journal your thoughts between sessions, try quick exercises, and read doctor-written articles in the Wellness Library for extra support.',
  },
  {
    title: '8. Track progress on the dashboard',
    description:
      'Return to the dashboard anytime to see completion percentage and which sections are in progress or done. Sign out from the top-right when finished.',
  },
];
