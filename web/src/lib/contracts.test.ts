import { describe, it, expect } from 'vitest';
import { namehash, labelToId, isValidLabel, getPrice, getPriceDisplay } from './contracts';

describe('namehash', () => {
  it('produces consistent hash for a label', () => {
    const hash1 = namehash('test');
    const hash2 = namehash('test');
    expect(hash1).toBe(hash2);
  });

  it('produces different hashes for different labels', () => {
    expect(namehash('alice')).not.toBe(namehash('bob'));
  });

  it('returns a hex string starting with 0x', () => {
    const hash = namehash('hello');
    expect(hash).toMatch(/^0x[a-f0-9]{64}$/);
  });
});

describe('labelToId', () => {
  it('returns a BigInt', () => {
    const id = labelToId('test');
    expect(typeof id).toBe('bigint');
  });

  it('produces consistent IDs', () => {
    expect(labelToId('test')).toBe(labelToId('test'));
  });

  it('produces different IDs for different labels', () => {
    expect(labelToId('alice')).not.toBe(labelToId('bob'));
  });
});

describe('isValidLabel', () => {
  it('accepts valid labels', () => {
    expect(isValidLabel('hello')).toBe(true);
    expect(isValidLabel('my-domain')).toBe(true);
    expect(isValidLabel('a')).toBe(true);
    expect(isValidLabel('test123')).toBe(true);
  });

  it('rejects empty string', () => {
    expect(isValidLabel('')).toBe(false);
  });

  it('rejects labels with spaces', () => {
    expect(isValidLabel('hello world')).toBe(false);
  });

  it('rejects labels with special characters', () => {
    expect(isValidLabel('hello!')).toBe(false);
    expect(isValidLabel('test@domain')).toBe(false);
  });

  it('rejects labels over 63 characters', () => {
    expect(isValidLabel('a'.repeat(64))).toBe(false);
  });

  it('accepts labels at exactly 63 characters', () => {
    expect(isValidLabel('a'.repeat(63))).toBe(true);
  });
});

describe('getPrice', () => {
  it('returns $100 for 1-2 char names', () => {
    expect(getPrice('ab')).toBe(100_000_000n);
    expect(getPrice('a')).toBe(100_000_000n);
  });

  it('returns $25 for 3 char names', () => {
    expect(getPrice('abc')).toBe(25_000_000n);
  });

  it('returns $10 for 4 char names', () => {
    expect(getPrice('abcd')).toBe(10_000_000n);
  });

  it('returns $5 for 5+ char names', () => {
    expect(getPrice('abcde')).toBe(5_000_000n);
    expect(getPrice('longname')).toBe(5_000_000n);
  });
});

describe('getPriceDisplay', () => {
  it('returns correct display string for 1-2 char names', () => {
    expect(getPriceDisplay('ab')).toBe('$100 USDC');
  });

  it('returns correct display string for 3 char names', () => {
    expect(getPriceDisplay('abc')).toBe('$25 USDC');
  });

  it('returns correct display string for 4 char names', () => {
    expect(getPriceDisplay('abcd')).toBe('$10 USDC');
  });

  it('returns correct display string for 5+ char names', () => {
    expect(getPriceDisplay('hello')).toBe('$5 USDC');
  });
});
