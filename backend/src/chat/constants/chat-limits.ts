function parseLimit(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const INTAKE_USER_MESSAGE_LIMIT = parseLimit(
  process.env.INTAKE_USER_MESSAGE_LIMIT,
  15,
);

export const SECTION_USER_MESSAGE_LIMIT = parseLimit(
  process.env.SECTION_USER_MESSAGE_LIMIT,
  20,
);
