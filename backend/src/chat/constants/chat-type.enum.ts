import {
  INTAKE_USER_MESSAGE_LIMIT,
  SECTION_USER_MESSAGE_LIMIT,
} from './chat-limits';

export enum ChatType {
  INTAKE_ASSESSMENT = 1,
  MOOD_EMOTIONAL_AWARENESS = 2,
  COGNITIVE_RESTRUCTURING = 3,
  BEHAVIORAL_ACTIVATION = 4,
  COPING_STRESS_MANAGEMENT = 5,
  RELAPSE_PREVENTION_GOALS = 6,
}

export {
  INTAKE_USER_MESSAGE_LIMIT,
  SECTION_USER_MESSAGE_LIMIT,
} from './chat-limits';

export const ASSIGNABLE_SECTION_TYPES = [
  ChatType.MOOD_EMOTIONAL_AWARENESS,
  ChatType.COGNITIVE_RESTRUCTURING,
  ChatType.BEHAVIORAL_ACTIVATION,
  ChatType.COPING_STRESS_MANAGEMENT,
  ChatType.RELAPSE_PREVENTION_GOALS,
];

export const CHAT_TYPE_LABELS: Record<ChatType, string> = {
  [ChatType.INTAKE_ASSESSMENT]: 'Intake Assessment',
  [ChatType.MOOD_EMOTIONAL_AWARENESS]: 'Mood & Emotional Awareness',
  [ChatType.COGNITIVE_RESTRUCTURING]: 'Cognitive Restructuring',
  [ChatType.BEHAVIORAL_ACTIVATION]: 'Behavioral Activation',
  [ChatType.COPING_STRESS_MANAGEMENT]: 'Coping & Stress Management',
  [ChatType.RELAPSE_PREVENTION_GOALS]: 'Relapse Prevention & Goals',
};

export function getUserMessageLimit(type: ChatType): number {
  if (type === ChatType.INTAKE_ASSESSMENT) {
    return INTAKE_USER_MESSAGE_LIMIT;
  }
  return SECTION_USER_MESSAGE_LIMIT;
}

export function getSessionCompleteMessage(type: ChatType): string {
  if (type === ChatType.INTAKE_ASSESSMENT) {
    return 'Your intake assessment is complete. A doctor will review everything you have shared. In 24 hours your report will be generated and shared with you — there is nothing else you need to do right now.';
  }
  return 'This section is complete. A doctor will review your progress. You can return to your dashboard or continue with your next assigned section when ready.';
}
