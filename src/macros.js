export function calculateMacros(calories, proteinRatio, carbRatio, fatRatio) {
  if (Math.abs(proteinRatio + carbRatio + fatRatio - 1) > 1e-6) {
    throw new Error('Ratios must sum to 1');
  }
  const protein = (calories * proteinRatio) / 4;
  const carbs = (calories * carbRatio) / 4;
  const fats = (calories * fatRatio) / 9;
  return { protein, carbs, fats };
}
