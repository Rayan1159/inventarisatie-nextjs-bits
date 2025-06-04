import {
    DataTypes,
    Model,
    Optional
} from 'sequelize';
import { CategoryItems } from './CategoryItems';

export interface CategoryAttr {
    id?: number;
    name: string;
}

interface CategoryCreationAttr extends Optional<CategoryAttr, 'id'> {}

export class Category extends Model<CategoryAttr, CategoryCreationAttr> {
    public id?: number;
    public name: string;

    static initModel(sequelize: any) {
        super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
        }, {
            sequelize,
            tableName: 'categories',
            timestamps: false,
            freezeTableName: true,
        });
        return this;
    }

    static addSqlCategory(category: any) {
        return this.create({
            name: category
        });
    }

    static async getCategories() {
        const categories: Category[] = await Category.findAll();
        return categories.map((category: Category) => {
            return {
                id: category.id,
                name: category.name
            }
        });
    }

    static async getCategoryNameById(id: number) {
        const category: Category = await Category.findOne({
            where: {
                id: id
            }
        }) as Category;
        return category.name;
    }

    static async getCategoryId(category: string) {
        const categoryId: Category = await Category.findOne({
            where: {
                name: category
            }
            }) as Category;
        return categoryId.id;
    } 
}

export default Category;