import { newInventory, Unit } from '../utils/validations/inventory.schema';

export const inventoryDataArray: newInventory[] = [
  // Burger Ingredients
  {
    id: "inv-beef-patty",
    name: "Beef Patty",
    unit: Unit.PIECES,
    currentStock: 100,
    lowStockThreshold: 20
  },
  {
    id: "inv-angus-beef-patty",
    name: "Angus Beef Patty",
    unit: Unit.PIECES,
    currentStock: 50,
    lowStockThreshold: 10
  },
  {
    id: "inv-chicken-fillet",
    name: "Chicken Fillet",
    unit: Unit.PIECES,
    currentStock: 80,
    lowStockThreshold: 15
  },
  {
    id: "inv-bacon-strips",
    name: "Bacon Strips",
    unit: Unit.PIECES,
    currentStock: 200,
    lowStockThreshold: 30
  },
  {
    id: "inv-american-cheese-slices",
    name: "American Cheese Slices",
    unit: Unit.PIECES,
    currentStock: 150,
    lowStockThreshold: 25
  },
  {
    id: "inv-burger-buns",
    name: "Burger Buns",
    unit: Unit.PIECES,
    currentStock: 120,
    lowStockThreshold: 20
  },
  {
    id: "inv-lettuce",
    name: "Lettuce",
    unit: Unit.KILOGRAMS,
    currentStock: 10,
    lowStockThreshold: 2
  },
  {
    id: "inv-tomatoes",
    name: "Tomatoes",
    unit: Unit.KILOGRAMS,
    currentStock: 15,
    lowStockThreshold: 3
  },
  {
    id: "inv-onions",
    name: "Onions",
    unit: Unit.KILOGRAMS,
    currentStock: 20,
    lowStockThreshold: 4
  },
  {
    id: "inv-ketchup",
    name: "Ketchup",
    unit: Unit.LITERS,
    currentStock: 5,
    lowStockThreshold: 1
  },
  {
    id: "inv-mustard",
    name: "Mustard",
    unit: Unit.LITERS,
    currentStock: 3,
    lowStockThreshold: 1
  },
  {
    id: "inv-arugula",
    name: "Arugula",
    unit: Unit.KILOGRAMS,
    currentStock: 5,
    lowStockThreshold: 1
  },
  {
    id: "inv-mushrooms",
    name: "Mushrooms",
    unit: Unit.KILOGRAMS,
    currentStock: 8,
    lowStockThreshold: 2
  },
  {
    id: "inv-onion-rings",
    name: "Onion Rings",
    unit: Unit.PIECES,
    currentStock: 300,
    lowStockThreshold: 50
  },
  {
    id: "inv-pineapple-slices",
    name: "Pineapple Slices",
    unit: Unit.PIECES,
    currentStock: 40,
    lowStockThreshold: 10
  },
  {
    id: "inv-teriyaki-sauce",
    name: "Teriyaki Sauce",
    unit: Unit.LITERS,
    currentStock: 2,
    lowStockThreshold: 0.5
  },

  // Pasta Ingredients
  {
    id: "inv-spaghetti-noodles",
    name: "Spaghetti Noodles",
    unit: Unit.KILOGRAMS,
    currentStock: 25,
    lowStockThreshold: 5
  },
  {
    id: "inv-fettuccine-noodles",
    name: "Fettuccine Noodles",
    unit: Unit.KILOGRAMS,
    currentStock: 20,
    lowStockThreshold: 4
  },
  {
    id: "inv-eggs",
    name: "Eggs",
    unit: Unit.PIECES,
    currentStock: 120,
    lowStockThreshold: 2
  },
  {
    id: "inv-pecorino-romano-cheese",
    name: "Pecorino Romano Cheese",
    unit: Unit.KILOGRAMS,
    currentStock: 3,
    lowStockThreshold: 0.5
  },
  {
    id: "inv-parmesan-cheese",
    name: "Parmesan Cheese",
    unit: Unit.KILOGRAMS,
    currentStock: 5,
    lowStockThreshold: 1
  },
  {
    id: "inv-guanciale",
    name: "Guanciale",
    unit: Unit.KILOGRAMS,
    currentStock: 2,
    lowStockThreshold: 0.3
  },
  {
    id: "inv-black-pepper",
    name: "Black Pepper",
    unit: Unit.GRAMS,
    currentStock: 500,
    lowStockThreshold: 100
  },
  {
    id: "inv-hungarian-sausage",
    name: "Hungarian Sausage",
    unit: Unit.KILOGRAMS,
    currentStock: 8,
    lowStockThreshold: 1.5
  },
  {
    id: "inv-tomato-sauce",
    name: "Tomato Sauce",
    unit: Unit.LITERS,
    currentStock: 10,
    lowStockThreshold: 2
  },
  {
    id: "inv-ground-beef",
    name: "Ground Beef",
    unit: Unit.KILOGRAMS,
    currentStock: 15,
    lowStockThreshold: 3
  },
  {
    id: "inv-banana-ketchup",
    name: "Banana Ketchup",
    unit: Unit.LITERS,
    currentStock: 5,
    lowStockThreshold: 1
  },
  {
    id: "inv-hotdogs",
    name: "Hotdogs",
    unit: Unit.PIECES,
    currentStock: 100,
    lowStockThreshold: 20
  },
  {
    id: "inv-butter",
    name: "Butter",
    unit: Unit.KILOGRAMS,
    currentStock: 5,
    lowStockThreshold: 1
  },
  {
    id: "inv-heavy-cream",
    name: "Heavy Cream",
    unit: Unit.LITERS,
    currentStock: 8,
    lowStockThreshold: 2
  },
  {
    id: "inv-garlic",
    name: "Garlic",
    unit: Unit.KILOGRAMS,
    currentStock: 2,
    lowStockThreshold: 0.3
  },

  // Desserts (Ready-to-sell)
  {
    id: "inv-leche-flan",
    name: "Leche Flan",
    unit: Unit.PIECES,
    currentStock: 25,
    lowStockThreshold: 5
  },
  {
    id: "inv-yema-cake", 
    name: "Yema Cake", 
    unit: Unit.PIECES,
    currentStock: 25,
    lowStockThreshold: 5
  },
  {
    id: "inv-brazo-de-mercedes",
    name: "Brazo De Mercedes",
    unit: Unit.PIECES, 
    currentStock: 20,
    lowStockThreshold: 4
  },
  {
    id: "inv-choco-dreamcake",
    name: "Choco Dreamcake",
    unit: Unit.PIECES,
    currentStock: 15,
    lowStockThreshold: 3
  },
  {
    id: "inv-biscoff-dreamcake",
    name: "Biscoff Dreamcake",
    unit: Unit.PIECES,
    currentStock: 30,
    lowStockThreshold: 6
  }
];

export default inventoryDataArray;