import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import Category from './Category';

export interface CategoryItemsAttributes {
    id?: number;
    category_id: number;
    item_id: number;
    item_name: string;
}

export class CategoryItems extends Model<CategoryItemsAttributes, CategoryItemsCreationAttributes> implements CategoryItemsAttributes {
    id!: number;
    category_id: number;
    item_id!: number;
    item_name!: string;

    category?: Category;

    static initModel(sequelize: Sequelize) {
        CategoryItems.init({
            category_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            item_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            item_name: {
                type: DataTypes.STRING,
                allowNull: false
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
        const items = await CategoryItems.findAll({
            where: {
                category_id: category.category_id
            }
        })
        Object.keys(items).forEach(([value]) => {
            console.log(value)
            keyArray.push(value);
        })
        console.log(keyArray);
        return keyArray;
    }
}

