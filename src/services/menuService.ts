import Menu from "../models/menu.model";
import { newMenu } from "../utils/validations/menu.schema";


const getAllMenu = async () => {
    const menu = await Menu.find({});
    return menu;
}

const createMenu = async (menuData: newMenu) => {
    const menu = new Menu(menuData);
    const savedMenu = await menu.save();
    return savedMenu;
}

const createManyMenus = async (menuItems: newMenu[]) => {
    const menus = await Menu.insertMany(menuItems);
    return menus;
}

export default {
    getAllMenu,
    createMenu,
    createManyMenus
}