import Inventory from "../models/inventory.model";
import { newInventory } from "../utils/validations/inventory.schema";


const getAllInventory = async () => {
    const inventory = await Inventory.find({});
    return inventory;
}

const createInventory = async (inventoryData: newInventory) => {
    const inventory = new Inventory(inventoryData);
    const savedInventory = await inventory.save();
    return savedInventory;
}

const createManyInventoryItems = async (inventoryItems: newInventory[]) => {
    const inventories = await Inventory.insertMany(inventoryItems);
    return inventories;
}

export default {
    getAllInventory,
    createInventory,
    createManyInventoryItems
}