import { DataTypes, Model, Optional } from 'sequelize';
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

    static associate(models: any) {
        CategoryItems.belongsTo(models.Category, {
            foreignKey: 'category_id',
            as: 'category',
            onDelete: 'CASCADE',
        });
    }

    static async getItemsAsKeys(category: {
        id: number;
    }) {
        const keyArray: string[] = []
        const items = await CategoryItems.findAll({
            where: {
                id: category.id
            }
        })
        Object.keys(items).forEach(([value]) => {
            console.log(value)
            keyArray.push(value);
        })
        return keyArray;
    }
}

