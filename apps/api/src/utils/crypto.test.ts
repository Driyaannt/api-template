import { describe, expect, it } from 'vitest';
import { hashToken, randomToken } from './crypto.js';

describe('token utilities', () => {
  it('creates a non-reversible token hash', () => {
    const token = randomToken();
    expect(token).not.toHaveLength(0);
    expect(hashToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashToken(token)).toBe(hashToken(token));
  });
});
