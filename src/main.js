import { calculateMacros } from './macros.js';
import { FoodManager } from './foods.js';
import { authenticate } from './auth.js';
import { Button } from './components/button.js';

const fm = new FoodManager();
fm.addFood({ name: 'Manzana', calories: 52 });
console.log('Foods:', fm.listFoods());

console.log('Auth admin/secret:', authenticate('admin', 'secret'));
console.log('Macros:', calculateMacros(2000, 0.3, 0.5, 0.2));

console.log('Button HTML:', Button('Click'));
