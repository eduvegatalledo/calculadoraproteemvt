import test from 'node:test';
import assert from 'node:assert/strict';
import { authenticate } from '../src/auth.js';

test('authentication validates user', () => {
  assert.ok(authenticate('admin', 'secret'));
  assert.ok(!authenticate('admin', 'wrong'));
});
