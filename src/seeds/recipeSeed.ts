import mongoose from 'mongoose';
import Recipe from '../models/recipe.model';
import recipeDataArray from '../data/recipeData';
import recipeService from '../services/recipeService';
import config from '../utils/config';

const seedRecipeData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to database successfully');

    console.log('Validating recipe references...');
    const validationErrors = await recipeService.validateRecipeReferences(recipeDataArray);
    
    if (validationErrors.length > 0) {
      console.error('Recipe validation failed:');
      validationErrors.forEach(error => console.error(`  - ${error}`));
      throw new Error('Recipe data contains invalid references. Please ensure menu and inventory data are seeded first.');
    }
    console.log('Recipe references validated successfully');

    console.log('Clearing existing recipe data...');
    await Recipe.deleteMany({});
    console.log('Existing recipe data cleared');

    console.log('Inserting new recipe data...');
    const recipeDataWithIds = recipeDataArray.map(item => ({ ...item, _id: item.id }));
    const insertedRecipes = await Recipe.insertMany(recipeDataWithIds);
    console.log(`Successfully seeded ${insertedRecipes.length} recipes`);

    console.log('\nInserted recipes:');
    insertedRecipes.forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.id} - Menu: ${recipe.menuItemId}, Ingredients: ${recipe.ingredientsUsed.length}`);
    });

  } catch (error) {
    console.error('Error seeding recipe data:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

export { seedRecipeData };

if (require.main === module) {
  seedRecipeData()
    .then(() => {
      console.log('\nRecipe data seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nRecipe data seeding failed:', error);
      process.exit(1);
    });
}