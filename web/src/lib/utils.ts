export function relativeTime(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export const CATEGORY_LABELS: Record<string, string> = {
  RESEARCH: 'Research',
  EIP_ERC: 'EIP/ERC',
  PROTOCOL_CALLS: 'Protocol Calls',
  GOVERNANCE: 'Governance',
  UPGRADE: 'Upgrade',
  ANNOUNCEMENT: 'Announcement',
  METRICS: 'Metrics',
  SECURITY: 'Security',
};

export const CATEGORY_BADGE_CLASS: Record<string, string> = {
  RESEARCH: 'badge-research',
  EIP_ERC: 'badge-eip',
  PROTOCOL_CALLS: 'badge-protocol',
  GOVERNANCE: 'badge-governance',
  UPGRADE: 'badge-upgrade',
  ANNOUNCEMENT: 'badge-announcement',
  METRICS: 'badge-metrics',
  SECURITY: 'badge-security',
};

// Keep old export name for backward compat
export const CATEGORY_COLORS = CATEGORY_BADGE_CLASS;
