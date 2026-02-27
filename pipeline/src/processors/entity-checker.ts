export interface EntityCheckResult {
  passed: boolean;
  missingEntities: string[];
}

const ENTITY_PATTERNS: RegExp[] = [
  /EIP-\d+/g,
  /ERC-\d+/g,
  /\d+(\.\d+)?%/g,
  /\$[\d,.]+[TBMK]?/gi,
  /v\d+\.\d+(\.\d+)?/g,
];

export function extractEntities(text: string): string[] {
  const entities: string[] = [];
  for (const pattern of ENTITY_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) entities.push(...matches);
  }
  return [...new Set(entities)];
}

export function checkEntityPreservation(
  sourceText: string,
  summary: string
): EntityCheckResult {
  const sourceEntities = extractEntities(sourceText);
  if (sourceEntities.length === 0) return { passed: true, missingEntities: [] };

  const missingEntities = sourceEntities.filter(
    entity => !summary.includes(entity)
  );

  // Pass if at least 80% of entities preserved,
  // AND all critical EIP/ERC numbers are present
  const preservationRate = 1 - missingEntities.length / sourceEntities.length;
  const criticalMissing = missingEntities.filter(e => /^E[IR][PC]-\d+$/i.test(e));

  return {
    passed: preservationRate >= 0.8 && criticalMissing.length === 0,
    missingEntities,
  };
}
