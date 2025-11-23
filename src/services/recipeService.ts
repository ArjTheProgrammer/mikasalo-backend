import Recipe from "../models/recipe.model";
import { newRecipe } from "../utils/validations/recipe.schema";
import Menu from "../models/menu.model";
import Inventory from "../models/inventory.model";


const getAllRecipes = async () => {
    const recipes = await Recipe.find({});
    return recipes;
}

const createRecipe = async (recipeData: newRecipe) => {
    const recipe = new Recipe(recipeData);
    const savedRecipe = await recipe.save();
    return savedRecipe;
}

const createManyRecipes = async (recipeItems: newRecipe[]) => {
    const recipes = await Recipe.insertMany(recipeItems);
    return recipes;
}

const validateRecipeReferences = async (recipeItems: newRecipe[]): Promise<string[]> => {
    const errors: string[] = [];
    
    // Get all existing menu and inventory IDs
    const existingMenuItems = await Menu.find({}, { _id: 1 });
    const existingInventoryItems = await Inventory.find({}, { _id: 1 });
    
    const menuIds = new Set(existingMenuItems.map(item => item._id));
    const inventoryIds = new Set(existingInventoryItems.map(item => item._id));
    
    // Validate each recipe
    for (const recipe of recipeItems) {
        // Check if menuItemId exists
        if (!menuIds.has(recipe.menuItemId)) {
            errors.push(`Recipe ${recipe.id}: Menu item '${recipe.menuItemId}' does not exist`);
        }
        
        // Check if all inventory items exist
        for (const ingredient of recipe.ingredientsUsed) {
            if (!inventoryIds.has(ingredient.inventoryId)) {
                errors.push(`Recipe ${recipe.id}: Inventory item '${ingredient.inventoryId}' does not exist`);
            }
        }
    }
    
    return errors;
}

export default {
    getAllRecipes,
    createRecipe,
    createManyRecipes,
    validateRecipeReferences
}