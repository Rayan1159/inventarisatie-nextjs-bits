import { DataTypes, Model, Sequelize} from 'sequelize';

export interface CategoryItemsAttributes {
    id?: number;
    entry_id?: number;
    category_id: number;
    item_name?: string;
    item_value?: string;
}

export class CategoryItems extends Model<CategoryItemsAttributes, CategoryItemsAttributes> implements CategoryItemsAttributes {
    id!: number;
    item_id: number;
    entry_id: number;
    category_id: number;
    item_name?: string;
    item_value?: string;

    static initModel(sequelize: Sequelize) {
        CategoryItems.init({
            category_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            item_name: {
                type: DataTypes.STRING,
                allowNull: true
            },
            item_value: {
                type: DataTypes.STRING,
                allowNull: true
            },
            entry_id: {
                type: DataTypes.INTEGER,
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
        const items = await CategoryItems.findAll({
          where: {
            category_id: catid
          }
        });
      
        const entriesMap = new Map<number, any>();
        items.forEach((item) => {
          const entryId = item.entry_id; 
          if (!entriesMap.has(entryId)) {
            entriesMap.set(entryId, {
              id: entryId,
              values: []
            });
          }
          entriesMap.get(entryId).values.push({
            key: item.item_name,
            value: item.item_value
          });
        });
      
        return {
          values: Array.from(entriesMap.values())
        };
      }


    static async setCategoryItemValue(catid: number, item: string, value: string, entryId: number) {
        await CategoryItems.update({
            item_value: value,
            entry_id: entryId
        }, {
            where: {
                category_id: catid,
                item_name: item,
                entry_id: entryId
            }
        });
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

    static async createNewEntry(catid: number, entry_name: string) {
        const entry = await CategoryItems.create({
            category_id: catid,
            entry_id: null
        });

        const entryId = entry.id;

        try {
            await CategoryItems.update(
                { entry_id: entryId },
                { where: { id: entryId } }
            );
        } catch (e: any) {
            console.error("Sequelize exception occurred while creating entry", e.message);
        }
        
        return entryId;
    }
}


