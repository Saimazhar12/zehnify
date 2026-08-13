import { ChatType } from '../constants/chat-type.enum';
import { INTAKE_ASSESSMENT_PROMPT } from './intake-assessment.prompt';
import { MOOD_EMOTIONAL_AWARENESS_PROMPT } from './mood-emotional-awareness.prompt';
import { COGNITIVE_RESTRUCTURING_PROMPT } from './cognitive-restructuring.prompt';
import { BEHAVIORAL_ACTIVATION_PROMPT } from './behavioral-activation.prompt';
import { COPING_STRESS_MANAGEMENT_PROMPT } from './coping-stress-management.prompt';
import { RELAPSE_PREVENTION_GOALS_PROMPT } from './relapse-prevention-goals.prompt';

const PROMPTS: Record<ChatType, string> = {
  [ChatType.INTAKE_ASSESSMENT]: INTAKE_ASSESSMENT_PROMPT,
  [ChatType.MOOD_EMOTIONAL_AWARENESS]: MOOD_EMOTIONAL_AWARENESS_PROMPT,
  [ChatType.COGNITIVE_RESTRUCTURING]: COGNITIVE_RESTRUCTURING_PROMPT,
  [ChatType.BEHAVIORAL_ACTIVATION]: BEHAVIORAL_ACTIVATION_PROMPT,
  [ChatType.COPING_STRESS_MANAGEMENT]: COPING_STRESS_MANAGEMENT_PROMPT,
  [ChatType.RELAPSE_PREVENTION_GOALS]: RELAPSE_PREVENTION_GOALS_PROMPT,
};

export function getSystemPrompt(type: ChatType): string {
  return PROMPTS[type] ?? '';
}
