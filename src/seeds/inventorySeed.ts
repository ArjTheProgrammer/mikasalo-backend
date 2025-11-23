import mongoose from 'mongoose';
import Inventory from '../models/inventory.model';
import inventoryDataArray from '../data/inventoryData';
import config from '../utils/config';

const seedInventoryData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to database successfully');

    console.log('Clearing existing inventory data...');
    await Inventory.deleteMany({});
    console.log('Existing inventory data cleared');

    console.log('Inserting new inventory data...');
    const inventoryDataWithIds = inventoryDataArray.map(item => ({ ...item, _id: item.id }));
    const insertedInventoryItems = await Inventory.insertMany(inventoryDataWithIds);
    console.log(`Successfully seeded ${insertedInventoryItems.length} inventory items`);

    console.log('\nInserted inventory items:');
    insertedInventoryItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} (${item.unit}) - Stock: ${item.currentStock}, Threshold: ${item.lowStockThreshold}`);
    });

  } catch (error) {
    console.error('Error seeding inventory data:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

export { seedInventoryData };

if (require.main === module) {
  seedInventoryData()
    .then(() => {
      console.log('\nInventory data seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nInventory data seeding failed:', error);
      process.exit(1);
    });
}