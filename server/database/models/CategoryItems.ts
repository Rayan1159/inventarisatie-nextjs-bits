import { DataTypes, Model, Sequelize} from 'sequelize';
import {Category} from "./Category";

export interface CategoryItemsAttributes {
    id?: number;
    category_id: number;
    item_name: string;
    item_value?: string;
}

export class CategoryItems extends Model<CategoryItemsAttributes, CategoryItemsCreationAttributes> implements CategoryItemsAttributes {
    id!: number;
    category_id: number;
    item_name: string;
    item_value?: string;

    static initModel(sequelize: Sequelize) {
        CategoryItems.init({
            category_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            item_name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            item_value: {
                type: DataTypes.STRING,
                allowNull: true
            }
        }, {
            sequelize,
            modelName: 'category_items',
            freezeTableName: true,
            timestamps: false
        });
    }

    static async getItemsAsKeys(category: {
        category_id: number;
    }) {
        const keyArray: string[] = []
        const items: CategoryItems[] = await CategoryItems.findAll({
            where: {
                category_id: category.category_id
            }
        })
        items.forEach((value) => {
            keyArray.push(value.item_name);
        });
        console.log(keyArray)
        return keyArray;
    }

    static async addCategoryItems(id: number, name: string) {
        await CategoryItems.create({
            item_name: name,
            category_id: id
        })
    }

    static async getCategoryItemValues(catid: number) {
        const categoryName = await Category.getCategoryNameById(catid);
        const value = await CategoryItems.findAll({
            where: {
                category_id: catid
            }
        })

        return value.map((item) => {
            return {
                key: item.item_name,
                value: item.item_value
            }
        })
    }

    static async setCategoryItemValue(catid: number, item: string, value: string) {
        await CategoryItems.update({
            item_value: value
        }, {
            where: {
                item_name: item
            }
        })

        console.log("category item value updated successfully for", item, "with value", value);
    }

    static async deleteCategoryItem(catid: number, itemKey: string) {
        console.log(itemKey);
        await CategoryItems.destroy({
            where: {
                category_id: catid,
                item_name: itemKey
            }
        });
        console.log("deleted item with name", itemKey, "for category id", catid);
    }
}


