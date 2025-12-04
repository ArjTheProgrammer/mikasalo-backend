import { newRecipe } from '../utils/validations/recipe.schema';

export const recipeDataArray: newRecipe[] = [
  // Burger Recipes
  {
    id: "recipe-menu-burger-american",
    menuItemId: "menu-burger-american",
    ingredientsUsed: [
      { inventoryId: "inv-beef-patty", quantityUsed: 1 },
      { inventoryId: "inv-american-cheese-slices", quantityUsed: 1 },
      { inventoryId: "inv-lettuce", quantityUsed: 0.05 }, // 50g
      { inventoryId: "inv-tomatoes", quantityUsed: 0.03 }, // 30g
      { inventoryId: "inv-onions", quantityUsed: 0.02 }, // 20g
      { inventoryId: "inv-ketchup", quantityUsed: 0.01 }, // 10ml
      { inventoryId: "inv-mustard", quantityUsed: 0.01 }, // 10ml
      { inventoryId: "inv-burger-buns", quantityUsed: 1 }
    ]
  },
  {
    id: "recipe-menu-burger-angus",
    menuItemId: "menu-burger-angus",
    ingredientsUsed: [
      { inventoryId: "inv-angus-beef-patty", quantityUsed: 1 },
      { inventoryId: "inv-onions", quantityUsed: 0.04 }, // 40g caramelized onions
      { inventoryId: "inv-arugula", quantityUsed: 0.03 }, // 30g
      { inventoryId: "inv-burger-buns", quantityUsed: 1 }
    ]
  },
  {
    id: "recipe-menu-burger-chicken-bacon",
    menuItemId: "menu-burger-chicken-bacon",
    ingredientsUsed: [
      { inventoryId: "inv-chicken-fillet", quantityUsed: 1 },
      { inventoryId: "inv-bacon-strips", quantityUsed: 2 },
      { inventoryId: "inv-lettuce", quantityUsed: 0.04 }, // 40g
      { inventoryId: "inv-burger-buns", quantityUsed: 1 }
    ]
  },
  {
    id: "recipe-menu-burger-overload",
    menuItemId: "menu-burger-overload",
    ingredientsUsed: [
      { inventoryId: "inv-beef-patty", quantityUsed: 2 }, // double patty
      { inventoryId: "inv-american-cheese-slices", quantityUsed: 2 }, // double cheese
      { inventoryId: "inv-mushrooms", quantityUsed: 0.05 }, // 50g sautéed
      { inventoryId: "inv-onion-rings", quantityUsed: 3 },
      { inventoryId: "inv-burger-buns", quantityUsed: 1 }
    ]
  },
  {
    id: "recipe-menu-burger-hawaiian-overload",
    menuItemId: "menu-burger-hawaiian-overload",
    ingredientsUsed: [
      { inventoryId: "inv-beef-patty", quantityUsed: 2 }, // double patty
      { inventoryId: "inv-american-cheese-slices", quantityUsed: 2 }, // double cheese
      { inventoryId: "inv-mushrooms", quantityUsed: 0.05 }, // 50g sautéed
      { inventoryId: "inv-onion-rings", quantityUsed: 3 },
      { inventoryId: "inv-pineapple-slices", quantityUsed: 1 },
      { inventoryId: "inv-teriyaki-sauce", quantityUsed: 0.02 }, // 20ml
      { inventoryId: "inv-burger-buns", quantityUsed: 1 }
    ]
  },

  // Pasta Recipes
  {
    id: "recipe-menu-pasta-carbonara",
    menuItemId: "menu-pasta-carbonara",
    ingredientsUsed: [
      { inventoryId: "inv-spaghetti-noodles", quantityUsed: 0.15 }, // 150g
      { inventoryId: "inv-eggs", quantityUsed: 2 }, // 2 eggs 
      { inventoryId: "inv-pecorino-romano-cheese", quantityUsed: 0.03 }, // 30g
      { inventoryId: "inv-guanciale", quantityUsed: 0.05 }, // 50g
      { inventoryId: "inv-black-pepper", quantityUsed: 2 } // 2g
    ]
  },
  {
    id: "recipe-menu-pasta-hungarian-sausage",
    menuItemId: "menu-pasta-hungarian-sausage",
    ingredientsUsed: [
      { inventoryId: "inv-spaghetti-noodles", quantityUsed: 0.15 }, // 150g
      { inventoryId: "inv-hungarian-sausage", quantityUsed: 0.08 }, // 80g
      { inventoryId: "inv-tomato-sauce", quantityUsed: 0.1 }, // 100ml
      { inventoryId: "inv-garlic", quantityUsed: 0.01 }, // 10g
      { inventoryId: "inv-onions", quantityUsed: 0.03 } // 30g
    ]
  },
  {
    id: "recipe-menu-pasta-filipino-spaghetti",
    menuItemId: "menu-pasta-filipino-spaghetti",
    ingredientsUsed: [
      { inventoryId: "inv-spaghetti-noodles", quantityUsed: 0.15 }, // 150g
      { inventoryId: "inv-ground-beef", quantityUsed: 0.1 }, // 100g
      { inventoryId: "inv-banana-ketchup", quantityUsed: 0.08 }, // 80ml
      { inventoryId: "inv-hotdogs", quantityUsed: 2 },
      { inventoryId: "inv-parmesan-cheese", quantityUsed: 0.02 } // 20g
    ]
  },
  {
    id: "recipe-menu-pasta-alfredo",
    menuItemId: "menu-pasta-alfredo",
    ingredientsUsed: [
      { inventoryId: "inv-fettuccine-noodles", quantityUsed: 0.15 }, // 150g
      { inventoryId: "inv-butter", quantityUsed: 0.03 }, // 30g
      { inventoryId: "inv-heavy-cream", quantityUsed: 0.1 }, // 100ml
      { inventoryId: "inv-parmesan-cheese", quantityUsed: 0.04 }, // 40g
      { inventoryId: "inv-garlic", quantityUsed: 0.005 } // 5g
    ]
  },
  {
    id: "recipe-menu-pasta-pesto",
    menuItemId: "menu-pasta-pesto",
    ingredientsUsed: [
      { inventoryId: "inv-spaghetti-noodles", quantityUsed: 0.15 }, // 150g
      { inventoryId: "inv-fresh-basil", quantityUsed: 15 }, // 15 leaves
      { inventoryId: "inv-cashews", quantityUsed: 10 }, // 10 pieces
      { inventoryId: "inv-olive-oil", quantityUsed: 0.025 }, // 25ml
      { inventoryId: "inv-garlic", quantityUsed: 0.01 }, // 10g
      { inventoryId: "inv-parmesan-cheese", quantityUsed: 0.03 } // 30g
    ]
  },

  // Dessert Recipes (Pre-made items - 1:1 ratio)
  {
    id: "recipe-menu-dessert-leche-flan",
    menuItemId: "menu-dessert-leche-flan",
    ingredientsUsed: [
      { inventoryId: "inv-leche-flan", quantityUsed: 1 }
    ]
  },
  {
    id: "recipe-menu-dessert-yema-cake",
    menuItemId: "menu-dessert-yema-cake",
    ingredientsUsed: [
      { inventoryId: "inv-yema-cake", quantityUsed: 1 }
    ]
  },
  {
    id: "recipe-menu-dessert-brazo-mercedes",
    menuItemId: "menu-dessert-brazo-mercedes",
    ingredientsUsed: [
      { inventoryId: "inv-brazo-de-mercedes", quantityUsed: 1 }
    ]
  },
  {
    id: "recipe-menu-dessert-choco-dreamcake",
    menuItemId: "menu-dessert-choco-dreamcake",
    ingredientsUsed: [
      { inventoryId: "inv-choco-dreamcake", quantityUsed: 1 }
    ]
  },
  {
    id: "recipe-menu-dessert-biscoff-dreamcake",
    menuItemId: "menu-dessert-biscoff-dreamcake",
    ingredientsUsed: [
      { inventoryId: "inv-biscoff-dreamcake", quantityUsed: 1 }
    ]
  }
];

export default recipeDataArray;
