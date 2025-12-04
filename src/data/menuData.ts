import { newMenu, Category } from '../utils/validations/menu.schema';

export const menuDataArray: newMenu[] = [
  {
    id: "menu-burger-american",
    name: "American Burger",
    description: "A classic burger featuring a juicy beef patty, fresh lettuce, tomato, onion, and a slice of American cheese, typically served with ketchup and mustard on a toasted bun.",
    price: 195.00,
    category: Category.BURGER,
    isAvailable: true,
    imageUrl: 'https://www.unileverfoodsolutions.us/dam/global-ufs/mcos/NAM/calcmenu/recipes/US-recipes/sandwiches/all-american-burger/main-header.jpg'
  },
  {
    id: "menu-burger-angus",
    name: "Angus Burger",
    description: "A premium burger made with a richer, more flavorful Angus beef patty. Topped with gourmet fixings like caramelized onions, arugula, and a special sauce.",
    price: 95.00,
    category: Category.BURGER,
    isAvailable: true,
    imageUrl: 'https://angelbay.com/hubfs/2023%20-%20Angel%20Bay%20Website/Recipes/Images/780x750/Angus-Beef-and-Mushroom-Burger-Angel-Bay-Recipe-780x750.jpg'
  },
  {
    id: "menu-burger-chicken-bacon",
    name: "Chicken Fillet w/ Bacon",
    description: "A non-beef option featuring a crispy or grilled chicken fillet, topped with smoky bacon strips, lettuce, and a creamy dressing.",
    price: 120.00,
    category: Category.BURGER,
    isAvailable: true,
    imageUrl: 'https://www.brakebush.com/wp-content/uploads/Traditional-Chicken-Burger.jpg'
  },
  {
    id: "menu-burger-overload",
    name: "Overload",
    description: "A massive, stacked burger featuring a double patty, double cheese, and extra toppings like sautéed mushrooms and onion rings.",
    price: 130.00,
    category: Category.BURGER,
    isAvailable: true,
    imageUrl: 'https://cdn.ordermo.ph/photos/resto/7oBzMYnM/cover.jpg?v=1662097999695'
  },
  {
    id: "menu-burger-hawaiian-overload",
    name: "Hawaiian Overload",
    description: "The 'Overload' concept with a sweet and savory twist, adding a slice of grilled pineapple and a special teriyaki or tangy sauce.",
    price: 150.00,
    category: Category.BURGER,
    isAvailable: true,
    imageUrl: 'https://www.tasteofhome.com/wp-content/uploads/2018/01/Aloha-Burgers_EXPS_FT24_1460_EC_053024_7.jpg'
  },
  {
    id: "menu-pasta-carbonara",
    name: "Carbonara",
    description: "A classic Italian pasta dish made with spaghetti, a creamy sauce of egg yolk, grated Pecorino/Parmesan cheese, guanciale (or bacon), and black pepper.",
    price: 95.00,
    category: Category.PASTA,
    isAvailable: true,
    imageUrl: 'https://www.simplyrecipes.com/thmb/4rVYqq80fd-kHTx25yKtd8bvHzA=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Simply-Pasta-Carbonara-LEAD-4-3c433b3057e7465b8738b43de762df06.jpg'
  },
  {
    id: "menu-pasta-hungarian-sausage",
    name: "Hungarian Sausage",
    description: "Pasta tossed in a rich, slightly spicy tomato-based sauce featuring slices of smoked and flavorful Hungarian sausage.",
    price: 95.00,
    category: Category.PASTA,
    isAvailable: true,
    imageUrl: 'https://freshoptions.ph/cdn/shop/articles/Aglio_e_Oglio_Pasta_with_Chicken_Hungarian_Sausage_E-Commerce_2010_x_2475px_82a1b311-9d00-4341-9a04-8f40de1f42cf_2010x.jpg?v=1628580303'
  },
  {
    id: "menu-pasta-filipino-spaghetti",
    name: "Filipino Spaghetti",
    description: "A sweet and savory version of spaghetti beloved in the Philippines. Features a ground meat sauce sweetened with banana ketchup and often includes sliced hotdogs and topped with grated cheese.",
    price: 95.00,
    category: Category.PASTA,
    isAvailable: true,
    imageUrl: 'https://cdn.apartmenttherapy.info/image/upload/f_jpg,q_auto:eco,c_fill,g_auto,w_1500,ar_1:1/k%2FPhoto%2FRecipes%2F2024-09-Filipino-spaghetti%2FFilipino-spaghetti-179'
  },
  {
    id: "menu-pasta-alfredo",
    name: "Alfredo",
    description: "A simple but decadent Italian-American classic: fettuccine pasta tossed in a rich, creamy sauce made from butter, heavy cream, and Parmesan cheese.",
    price: 110.00,
    category: Category.PASTA,
    isAvailable: true,
    imageUrl: 'https://gimmedelicious.com/wp-content/uploads/2024/10/Skinny-Chicken-Broccoli-Alfredo-1.jpg'
  },
  {
    id: "menu-pasta-pesto",
    name: "Pesto",
    description: "A vibrant Italian classic with a Filipino twist: spaghetti tossed in a fresh basil pesto made with aromatic garlic, cashews, Parmesan cheese, and olive oil. A fusion of traditional Italian technique with locally-accessible ingredients.",
    price: 95.00,
    category: Category.PASTA,
    isAvailable: true,
    imageUrl: 'https://cdn.loveandlemons.com/wp-content/uploads/2025/07/pesto-pasta.jpg'
  },
  {
    id: "menu-dessert-leche-flan",
    name: "Leche Flan",
    description: "A creamy, traditional Filipino custard dessert topped with a soft layer of caramelized sugar. Known for its rich texture and sweet, milky flavor.",
    price: 85.00,
    category: Category.DESSERT,
    isAvailable: true,
    imageUrl: 'https://salu-salo.com/wp-content/uploads/2014/09/Leche-Flan-with-Cream-Cheese-7.jpg'
  },
  {
    id: "menu-dessert-yema-cake",
    name: "Yema Cake",
    description: "A fluffy chiffon or sponge cake topped and filled with Yema, a sweet custard-like spread made from egg yolks and condensed milk.",
    price: 85.00,
    category: Category.DESSERT,
    isAvailable: true,
    imageUrl: 'https://www.angsarap.net/wp-content/uploads/2016/11/Yema-Cake-Wide-720x480.jpg'
  },
  {
    id: "menu-dessert-brazo-mercedes",
    name: "Brazo De Mercedes",
    description: "A classic Filipino meringue roll with a rich, yellow custard filling. It is light, airy, and delicately sweet.",
    price: 85.00,
    category: Category.DESSERT,
    isAvailable: true,
    imageUrl: 'https://www.seriouseats.com/thmb/75l3kiixLd3GS5ihEaCWPSYNGBw=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/2024020120240129-brazo-de-mercedes-rezel-kealoha-51-SEA-66741383db5d46469525c14b270778ec.jpg'
  },
  {
    id: "menu-dessert-choco-dreamcake",
    name: "Choco Dreamcake",
    description: "A decadent, layered chocolate cake often served in a tin. Typically features a moist cake base, a creamy chocolate mousse, a ganache layer, and a top dusting of cocoa powder.",
    price: 95.00,
    category: Category.DESSERT,
    isAvailable: true,
    imageUrl: 'https://cdn.phonebooky.com/blog/wp-content/uploads/2019/10/11101610/Screen-Shot-2019-10-11-at-10.15.34-AM.jpg'
  },
  {
    id: "menu-dessert-biscoff-dreamcake",
    name: "Biscoff Dreamcake",
    description: "A layered cake similar to the Choco Dreamcake, but featuring the distinct flavor of Biscoff (speculoos) cookies and spread in its layers, mousse, or topping.",
    price: 65.00,
    category: Category.DESSERT,
    isAvailable: true,
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSm4VqW9-gTGrZdqqSrSfp5gv5VIInymmk2LQ&s'
  }
];

export default menuDataArray;
