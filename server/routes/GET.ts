import { Request, Response, NextFunction, Router } from "express";
import { Inventory } from "../database/models/Inventory";
import sequelize from "../database/sequelize";
import Category from "../database/models/Category";
import { CategoryItems } from "../database/models/CategoryItems";

Inventory.initModel(sequelize);
Category.initModel(sequelize);
CategoryItems.initModel(sequelize);

const routerGet = Router();

routerGet.post(
  "/inventory",
  async (req: Request, res: Response, _next: NextFunction) => {
    const entries = await Inventory.getEntries();
    res.send(entries ? entries : ["no entries found"]);
  },
);

routerGet.post(
  "/inventory/categories/keys",
  async (req, res, next) => {
    const keys = await Category.getCategories();
    if (keys) res.status(200).json(keys);
  } 
)

routerGet.get(
  "/inventory/categories/all",
  async (req, res, next) => {
    res.send(await Category.getCategories())
  }
)

routerGet.post('/inventory/categories/items/update', async (req, res, next) => {
  try {
    const { category, items}: { category: string, items: { 
      item_name: string
     } } = req.body;

    if (!category) {
      return res.status(400).json({ error: "No category provided" });
    }

    const categoryId = await Category.getCategoryId(category);
    if (!categoryId) {
      return res.status(400).json({ error: "Category does not exist" });
    }

    await CategoryItems.addCategoryItems(categoryId, items.item_name);

    res.status(200).json({
      status: 200,
      message: "Category items updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: "An error occurred while updating category items.",
    });
  }
});

routerGet.post(
  "/inventory/categories/column/add",
  async (req, res, next) => {
    const { category, column } = req.body;
    if (!category) return res.status(400).json({ error: "No category provided" });
    const categoryId = await Category.getCategoryId(category);
    if (!categoryId) return res.status(400).json({ error: "Category does not exist" });
    await CategoryItems.addCategoryItems(categoryId as number, column);
    res.status(200);
  }
)

routerGet.post(
  "/inventory/categories/content/keys",
  async (req, res, next) => {
    const { category } = req.body
    if (!category) return res.status(400).json({ error: "No category provided" });
    const categoryId = await Category.getCategoryId(category)
    const itemsAsKeys = await CategoryItems.getItemsAsKeys({ category_id: categoryId} as { 
      category_id: number 
    });
    if (itemsAsKeys) res.status(200).json(itemsAsKeys)
  }
)

routerGet.post(
  "/inventory/categories/exists",
  async (req, res, _next) => {
      const categories = await Category.getCategories()
      const requestCategory = req.body.category;
      const mapped = categories.map((key, _index) => {
          if (key == null) return;
          if (key.name == requestCategory) return true;
          return false;
      })
      if (mapped) {
          res.status(200).json({
              exists: true
          })
      }
  }
)

routerGet.post(
  '/inventory/categories/values/delete',
  async (req, res, next) => {
    const { category, item } = req.body;
    const catId = await Category.getCategoryId(category);
    console.log(catId, category);
    await CategoryItems.deleteCategoryItem(catId as number, item);
    res.status(200).json({
      status: 200,
      message: "Category item deleted successfully."
    });
  }
)

routerGet.post(
  "/inventory/categories/update", 
  async (req, res, next) => {

  await Category.addSqlCategory(req.body.category);

  res.status(200).json({
    status: 200,
  });
});

routerGet.post(
  "/inventory/categories/values", 
  async (req, res, next) => {

    const { category } = req.body;
    const catId = await Category.getCategoryId(category);

    const value = await CategoryItems.getCategoryItemValues(catId as number);

    res.status(200).json({
      values: value
    });
});

routerGet.post(
    "/inventory/categories/values/update",
    async (req, res, next) => {
        const { category, item, value, id} = req.body;
        console.log("Updating item:", { category, item, value, id });

        try {
            const catId = await Category.getCategoryId(category);
            console.log("Category ID:", catId);

            await CategoryItems.setCategoryItemValue(catId as number, item, value, id);
            console.log("Update successful");

            res.status(200).json({
                status: 200,
                message: "Category item value updated successfully."
            });
        } catch (error) {
            console.error("Error updating item:", error);
            res.status(500).json({
                status: 500,
                message: "Failed to update category item value."
            });
        }
    }
)

routerGet.post(
  "/entry/create", async (req, res) => {
    try {
      const { category } = req.body;
      const cat = await Category.findOne({ where: { name: category } });
      
      if (!cat) {
          return res.status(404).json({ error: 'Category not found' });
      }

      const entryId = await CategoryItems.createNewEntry(cat.id, "default item");
      res.json({ id: entryId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
)

export default routerGet;
