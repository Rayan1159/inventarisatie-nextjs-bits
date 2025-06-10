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
        console.log("Executing update with:", { catid, item, value, entryId });

        try {
            // First, try to update existing record
            const [updateCount] = await CategoryItems.update({
                item_value: value,
            }, {
                where: {
                    category_id: catid,
                    item_name: item,
                    entry_id: entryId
                }
            });

            // If no record was updated, create a new one
            if (updateCount === 0) {
                console.log("No existing record found, creating new one");
                await CategoryItems.create({
                    category_id: catid,
                    item_name: item,
                    item_value: value,
                    entry_id: entryId
                });
            }

            console.log("Update/Create successful");
            return true;
        } catch (error) {
            console.error("Database update error:", error);
            throw error;
        }
    }

    static async deleteCategoryItem(catid: number, entryId: string) {
        console.log("Deleting entry:", entryId, "from category:", catid);
        await CategoryItems.destroy({
            where: {
                category_id: catid,
                entry_id: parseInt(entryId)
            }
        });

        console.log("deleted entry with id", entryId, "for category id", catid);
    }

    static async createNewEntry(catid: number, entry_name: string) {
        try {
            // First, get all existing item names (columns) for this category
            const existingItems = await CategoryItems.findAll({
                where: {
                    category_id: catid
                },
                attributes: ['item_name'],
                group: ['item_name']
            });

            // Create the initial entry
            const entry = await CategoryItems.create({
                category_id: catid,
                entry_id: null
            });

            const entryId = entry.id;

            // Update the entry_id to reference itself
            await CategoryItems.update(
                { entry_id: entryId },
                { where: { id: entryId } }
            );

            // Create placeholder records for all existing columns
            const uniqueItemNames = [...new Set(existingItems.map(item => item.item_name))];
            
            for (const itemName of uniqueItemNames) {
                if (itemName) { // Only create if item_name is not null
                    await CategoryItems.create({
                        category_id: catid,
                        item_name: itemName,
                        item_value: "", // Empty string as default
                        entry_id: entryId
                    });
                }
            }

            console.log(`Created new entry ${entryId} with ${uniqueItemNames.length} column placeholders`);
            return entryId;
        } catch (e: any) {
            console.error("Sequelize exception occurred while creating entry", e.message);
            throw e;
        }
    }
}


