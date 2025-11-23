import mongoose from 'mongoose';
import config from '../utils/config';

const seedAllData = async () => {
  try {
    console.log('Starting master seed process...\n');
    
    // Connect to database once
    console.log('Connecting to database...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to database successfully\n');

    console.log('Step 1/3: Seeding inventory data...');
    await seedInventoryStep();
    
    console.log('\nStep 2/3: Seeding menu data...');
    await seedMenuStep();
    
    console.log('\nStep 3/3: Seeding recipe data...');
    await seedRecipeStep();
    
    console.log('\nMaster seed process completed successfully!');
    console.log('Summary:');
    console.log('- ✓ Inventory items seeded');
    console.log('- ✓ Menu items seeded');
    console.log('- ✓ Recipes seeded');

  } catch (error) {
    console.error('\nMaster seed process failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

const seedInventoryStep = async () => {
  const Inventory = (await import('../models/inventory.model')).default;
  const inventoryDataArray = (await import('../data/inventoryData')).default;
  
  console.log('Clearing existing inventory data...');
  await Inventory.deleteMany({});
  
  console.log('Inserting inventory data...');
  const inventoryDataWithIds = inventoryDataArray.map(item => ({ ...item, _id: item.id }));
  const insertedInventoryItems = await Inventory.insertMany(inventoryDataWithIds);
  console.log(`Successfully seeded ${insertedInventoryItems.length} inventory items`);
};

const seedMenuStep = async () => {
  const Menu = (await import('../models/menu.model')).default;
  const menuDataArray = (await import('../data/menuData')).default;
  
  console.log('Clearing existing menu data...');
  await Menu.deleteMany({});
  
  console.log('Inserting menu data...');
  const menuDataWithIds = menuDataArray.map(item => ({ ...item, _id: item.id }));
  const insertedMenus = await Menu.insertMany(menuDataWithIds);
  console.log(`Successfully seeded ${insertedMenus.length} menu items`);
};

const seedRecipeStep = async () => {
  const Recipe = (await import('../models/recipe.model')).default;
  const recipeDataArray = (await import('../data/recipeData')).default;
  const recipeService = (await import('../services/recipeService')).default;
  
  console.log('Validating recipe references...');
  const validationErrors = await recipeService.validateRecipeReferences(recipeDataArray);
  
  if (validationErrors.length > 0) {
    console.error('Recipe validation failed:');
    validationErrors.forEach(error => console.error(`  - ${error}`));
    throw new Error('Recipe data contains invalid references.');
  }
  
  console.log('Clearing existing recipe data...');
  await Recipe.deleteMany({});
  
  console.log('Inserting recipe data...');
  const recipeDataWithIds = recipeDataArray.map(item => ({ ...item, _id: item.id }));
  const insertedRecipes = await Recipe.insertMany(recipeDataWithIds);
  console.log(`Successfully seeded ${insertedRecipes.length} recipes`);
};

export { seedAllData };

if (require.main === module) {
  seedAllData()
    .then(() => {
      console.log('\nAll data seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nData seeding failed:', error);
      process.exit(1);
    });
}