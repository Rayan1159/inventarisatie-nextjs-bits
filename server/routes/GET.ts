import { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { Inventory } from "../database/models/Inventory";
import sequelize from "../database/sequelize";
import * as fs from "fs";
import * as path from "path";
import { getCategories } from '../../src/fn/category';
import Category from "../database/models/Category";

Inventory.initModel(sequelize);
Category.initModel(sequelize);

const router = Router();

const BASE_DIR = __dirname;
const CATEGORY_JSON = path.join(BASE_DIR, "../data", "categories.json");
const CATEGORY_DATA = JSON.parse(fs.readFileSync(CATEGORY_JSON, "utf-8"));

router.get(
  "/inventory",
  async (req: Request, res: Response, _next: NextFunction) => {
    const entries = await Inventory.getEntries();
    res.send(entries ? entries : ["no entries found"]);
  },
);

router.get(
  "/inventory/categories",
  async (req, res, next) => {
  res.send(CATEGORY_DATA);
});

router.get(
  "/inventory/categories/keys",
  async (req, res, next) => {
    const categories = await Category.getCategories();
    if (categories) res.json(categories)
});

router.get(
  "/inventory/categories/all",
  async (req, res, next) => {
    res.send(await getCategories())
  }
)
router.post(
  "/inventory/categories/update", 
  async (req, res, next) => {

  await Category.addSqlCategory(req.body.category);

  res.status(200).json({
    status: 200,
  });
});


export default router;