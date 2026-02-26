export const CATEGORIES = [
  'RESEARCH',
  'EIP_ERC',
  'PROTOCOL_CALLS',
  'GOVERNANCE',
  'UPGRADE',
  'ANNOUNCEMENT',
  'METRICS',
  'SECURITY',
] as const;

export type Category = (typeof CATEGORIES)[number];
