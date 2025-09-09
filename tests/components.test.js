import test from 'node:test';
import assert from 'node:assert/strict';
import { Button } from '../src/components/button.js';

test('button renders HTML', () => {
  assert.equal(Button('Hi'), '<button>Hi</button>');
});
