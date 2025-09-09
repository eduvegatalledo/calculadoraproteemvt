export class FoodManager {
  constructor() {
    this.foods = [];
  }

  addFood(food) {
    this.foods.push(food);
  }

  removeFood(name) {
    this.foods = this.foods.filter(f => f.name !== name);
  }

  listFoods() {
    return [...this.foods];
  }
}
