import test from 'node:test';
import assert from 'node:assert/strict';
import { FoodManager } from '../src/foods.js';

test('food manager adds and removes foods', () => {
  const fm = new FoodManager();
  fm.addFood({ name: 'Apple' });
  assert.equal(fm.listFoods().length, 1);
  fm.removeFood('Apple');
  assert.equal(fm.listFoods().length, 0);
});
