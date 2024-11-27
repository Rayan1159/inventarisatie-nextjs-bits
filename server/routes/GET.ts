import { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { Inventory } from "../database/models/Inventory";
import sequelize from "../database/sequelize";
import * as fs from "fs";
import * as path from "path";
import Category from "../database/models/Category";
import { CategoryItems } from "../database/models/CategoryItems";

Inventory.initModel(sequelize);
Category.initModel(sequelize);
CategoryItems.initModel(sequelize);

const routerGet = Router();

const BASE_DIR = __dirname;
const CATEGORY_JSON = path.join(BASE_DIR, "../data", "categories.json");
const CATEGORY_DATA = JSON.parse(fs.readFileSync(CATEGORY_JSON, "utf-8"));

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
});

routerGet.get(
  "/inventory/categories/all",
  async (req, res, next) => {
    res.send(await Category.getCategories())
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
  "/inventory/categories/update", 
  async (req, res, next) => {

  await Category.addSqlCategory(req.body.category);

  res.status(200).json({
    status: 200,
  });
});


export default routerGet;
