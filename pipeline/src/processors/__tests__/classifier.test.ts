import { describe, it, expect } from 'vitest';
import { classify } from '../classifier.js';

describe('classify', () => {
  it('maps ethresear.ch to RESEARCH', () => {
    expect(classify('ethresear.ch')).toBe('RESEARCH');
  });

  it('maps ethereum-magicians.org to EIP_ERC', () => {
    expect(classify('ethereum-magicians.org')).toBe('EIP_ERC');
  });

  it('maps github.com/ethereum/EIPs to EIP_ERC', () => {
    expect(classify('github.com/ethereum/EIPs')).toBe('EIP_ERC');
  });

  it('maps gov.optimism.io to GOVERNANCE', () => {
    expect(classify('gov.optimism.io')).toBe('GOVERNANCE');
  });

  it('maps defillama.com/stablecoins to METRICS', () => {
    expect(classify('defillama.com/stablecoins')).toBe('METRICS');
  });

  it('maps rekt.news to SECURITY', () => {
    expect(classify('rekt.news')).toBe('SECURITY');
  });

  it('maps blog.ethereum.org to ANNOUNCEMENT', () => {
    expect(classify('blog.ethereum.org')).toBe('ANNOUNCEMENT');
  });

  it('maps github.com/ethereum/go-ethereum to UPGRADE', () => {
    expect(classify('github.com/ethereum/go-ethereum')).toBe('UPGRADE');
  });

  it('maps hackmd.io/@timbeiko/acd to PROTOCOL_CALLS', () => {
    expect(classify('hackmd.io/@timbeiko/acd')).toBe('PROTOCOL_CALLS');
  });

  it('defaults unknown source to ANNOUNCEMENT', () => {
    expect(classify('unknown-source.example.com')).toBe('ANNOUNCEMENT');
  });

  it('returns ANNOUNCEMENT for empty string sourceId', () => {
    expect(classify('')).toBe('ANNOUNCEMENT');
  });

  it('returns ANNOUNCEMENT for sourceId with trailing whitespace (no match)', () => {
    // 'ethresear.ch ' does not match 'ethresear.ch' in the Map
    expect(classify('ethresear.ch ')).toBe('ANNOUNCEMENT');
  });

  it('returns ANNOUNCEMENT for uppercase sourceId (Map keys are case-sensitive)', () => {
    // 'ETHRESEAR.CH' does not match 'ethresear.ch' in the Map
    expect(classify('ETHRESEAR.CH')).toBe('ANNOUNCEMENT');
  });
});
