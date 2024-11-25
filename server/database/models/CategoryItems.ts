import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import Category from './Category';
import { P } from 'pino';

export interface CategoryItemsAttributes {
    id?: number;
    category_id: number;
    item_id: number;
    item_name: string;
}

export interface CategoryItemsCreationAttributes extends Optional<CategoryItemsAttributes, "id"> {
    category_id: number;
    item_id: number;
    item_name: string;
}

export class CategoryItems extends Model<CategoryItemsAttributes, CategoryItemsCreationAttributes> implements CategoryItemsAttributes {
    id!: number;
    category_id!: number;
    item_id!: number;
    item_name!: string;

    category?: Category;

    static initModel(sequelize: Sequelize) {
        CategoryItems.init({
            category_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'categories',
                    key: 'id'
                }
            },
            item_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'items',
                    key: 'id'
                }
            },
            item_name: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }, {
            sequelize,
            modelName: 'category_items',
        });

        CategoryItems.belongsTo(Category, {
            foreignKey: 'category_id',
            as: 'category',
            onDelete: 'CASCADE',
        });
    }

    static associate(models: any) {
        CategoryItems.belongsTo(models.Category, {
            foreignKey: 'category_id',
            as: 'category',
            onDelete: 'CASCADE',
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
        return keyArray;
    }
}

