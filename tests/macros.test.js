import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMacros } from '../src/macros.js';

test('calculate macros distributes calories', () => {
  const result = calculateMacros(2000, 0.3, 0.5, 0.2);
  assert.equal(Math.round(result.protein), 150);
  assert.equal(Math.round(result.carbs), 250);
  assert.equal(Math.round(result.fats), 44);
});
