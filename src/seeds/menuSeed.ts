import mongoose from 'mongoose';
import Menu from '../models/menu.model';
import menuDataArray from '../data/menuData';
import config from '../utils/config';

const seedMenuData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to database successfully');

    console.log('Clearing existing menu data...');
    await Menu.deleteMany({});
    console.log('Existing menu data cleared');

    console.log('Inserting new menu data...');
    const menuDataWithIds = menuDataArray.map(item => ({ ...item, _id: item.id }));
    const insertedMenus = await Menu.insertMany(menuDataWithIds);
    console.log(`Successfully seeded ${insertedMenus.length} menu items`);

    console.log('\nInserted menu items:');
    insertedMenus.forEach((menu, index) => {
      console.log(`${index + 1}. ${menu.name} (${menu.category}) - ₱${menu.price}`);
    });

  } catch (error) {
    console.error('Error seeding menu data:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

export { seedMenuData };

if (require.main === module) {
  seedMenuData()
    .then(() => {
      console.log('\nMenu data seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nMenu data seeding failed:', error);
      process.exit(1);
    });
}