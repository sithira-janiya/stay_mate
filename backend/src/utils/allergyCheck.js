// backend/src/utils/allergyCheck.js
import { allergenLexicon } from "./allergenLexicon.js";

export const checkForAllergies = (ingredients, userAllergies) => {
  if (!userAllergies || userAllergies.length === 0) return false;
  
  const ingredientList = ingredients.toLowerCase().split(',').map(i => i.trim());
  const allergyList = userAllergies.map(a => a.toLowerCase().trim());
  
  // Check for direct matches
  for (const allergy of allergyList) {
    if (ingredientList.some(ingredient => ingredient.includes(allergy))) {
      return true;
    }
    
    // Check against lexicon
    if (allergenLexicon[allergy]) {
      for (const synonym of allergenLexicon[allergy]) {
        if (ingredientList.some(ingredient => ingredient.includes(synonym))) {
          return true;
        }
      }
    }
  }
  
  return false;
};

export const getAllergyWarnings = (meals, userAllergies) => {
  const warnings = [];
  
  if (!userAllergies || userAllergies.length === 0) return warnings;
  
  for (const meal of meals) {
    const hasAllergy = checkForAllergies(meal.ingredients, userAllergies);
    if (hasAllergy) {
      warnings.push({
        meal: meal.name,
        ingredients: meal.ingredients
      });
    }
  }
  
  return warnings;
};