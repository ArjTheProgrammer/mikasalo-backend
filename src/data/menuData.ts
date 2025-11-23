import { newMenu, Category } from '../utils/validations/menu.schema';

export const menuDataArray: newMenu[] = [
  {
    id: "menu-burger-american",
    name: "American Burger",
    description: "A classic burger featuring a juicy beef patty, fresh lettuce, tomato, onion, and a slice of American cheese, typically served with ketchup and mustard on a toasted bun.",
    price: 195.00,
    category: Category.BURGER,
    isAvailable: true
  },
  {
    id: "menu-burger-angus",
    name: "Angus Burger",
    description: "A premium burger made with a richer, more flavorful Angus beef patty. Topped with gourmet fixings like caramelized onions, arugula, and a special sauce.",
    price: 95.00,
    category: Category.BURGER,
    isAvailable: true
  },
  {
    id: "menu-burger-chicken-bacon",
    name: "Chicken Fillet w/ Bacon",
    description: "A non-beef option featuring a crispy or grilled chicken fillet, topped with smoky bacon strips, lettuce, and a creamy dressing.",
    price: 120.00,
    category: Category.BURGER,
    isAvailable: true
  },
  {
    id: "menu-burger-overload",
    name: "Overload",
    description: "A massive, stacked burger featuring a double patty, double cheese, and extra toppings like sautéed mushrooms and onion rings.",
    price: 130.00,
    category: Category.BURGER,
    isAvailable: true
  },
  {
    id: "menu-burger-hawaiian-overload",
    name: "Hawaiian Overload",
    description: "The 'Overload' concept with a sweet and savory twist, adding a slice of grilled pineapple and a special teriyaki or tangy sauce.",
    price: 150.00,
    category: Category.BURGER,
    isAvailable: true
  },
  {
    id: "menu-pasta-carbonara",
    name: "Carbonara",
    description: "A classic Italian pasta dish made with spaghetti, a creamy sauce of egg yolk, grated Pecorino/Parmesan cheese, guanciale (or bacon), and black pepper.",
    price: 95.00,
    category: Category.PASTA,
    isAvailable: true
  },
  {
    id: "menu-pasta-hungarian-sausage",
    name: "Hungarian Sausage",
    description: "Pasta tossed in a rich, slightly spicy tomato-based sauce featuring slices of smoked and flavorful Hungarian sausage.",
    price: 95.00,
    category: Category.PASTA,
    isAvailable: true
  },
  {
    id: "menu-pasta-filipino-spaghetti",
    name: "Filipino Spaghetti",
    description: "A sweet and savory version of spaghetti beloved in the Philippines. Features a ground meat sauce sweetened with banana ketchup and often includes sliced hotdogs and topped with grated cheese.",
    price: 95.00,
    category: Category.PASTA,
    isAvailable: true
  },
  {
    id: "menu-pasta-alfredo",
    name: "Alfredo",
    description: "A simple but decadent Italian-American classic: fettuccine pasta tossed in a rich, creamy sauce made from butter, heavy cream, and Parmesan cheese.",
    price: 110.00,
    category: Category.PASTA,
    isAvailable: true
  },
  {
    id: "menu-dessert-leche-flan",
    name: "Leche Flan",
    description: "A creamy, traditional Filipino custard dessert topped with a soft layer of caramelized sugar. Known for its rich texture and sweet, milky flavor.",
    price: 85.00,
    category: Category.DESSERT,
    isAvailable: true
  },
  {
    id: "menu-dessert-yema-cake",
    name: "Yema Cake",
    description: "A fluffy chiffon or sponge cake topped and filled with Yema, a sweet custard-like spread made from egg yolks and condensed milk.",
    price: 85.00,
    category: Category.DESSERT,
    isAvailable: true
  },
  {
    id: "menu-dessert-brazo-mercedes",
    name: "Brazo De Mercedes",
    description: "A classic Filipino meringue roll with a rich, yellow custard filling. It is light, airy, and delicately sweet.",
    price: 85.00,
    category: Category.DESSERT,
    isAvailable: true
  },
  {
    id: "menu-dessert-choco-dreamcake",
    name: "Choco Dreamcake",
    description: "A decadent, layered chocolate cake often served in a tin. Typically features a moist cake base, a creamy chocolate mousse, a ganache layer, and a top dusting of cocoa powder.",
    price: 95.00,
    category: Category.DESSERT,
    isAvailable: true
  },
  {
    id: "menu-dessert-biscoff-dreamcake",
    name: "Biscoff Dreamcake",
    description: "A layered cake similar to the Choco Dreamcake, but featuring the distinct flavor of Biscoff (speculoos) cookies and spread in its layers, mousse, or topping.",
    price: 65.00,
    category: Category.DESSERT,
    isAvailable: true
  }
];

export default menuDataArray;
