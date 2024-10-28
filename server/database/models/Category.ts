import {
    DataTypes,
    Model,
    Optional
} from 'sequelize';

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
        let categories: Category[] = await Category.findAll();
        return categories.map((category: Category) => {
            return {
                id: category.id,
                name: category.name
            }
        });
    }
}

export default Category;