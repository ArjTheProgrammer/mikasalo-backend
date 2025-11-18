import mongoose from 'mongoose';
import { Recipe } from '../utils/validations/recipe.schema';

const ingredientUsedSchema = new mongoose.Schema({
  inventoryId: {
    type: String,
    required: true
  },
  quantityUsed: {
    type: Number,
    required: true
  }
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  menuItemId: {
    type: String,
    required: true
  },
  ingredientsUsed: {
    type: [ingredientUsedSchema],
    required: true
  }
}, {
  timestamps: true
});

recipeSchema.set('toJSON', {
  transform: (_document: any, returnedObject: any) => {
    returnedObject.id = returnedObject._id.toString();

    delete (returnedObject as any)._id;
    delete (returnedObject as any).__v;
  }
});

const Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;