import { 
    DataTypes,
    Model,
    Optional 
} from "sequelize";


export interface InventoryAttr {
    id?: number;
    name: string;
    description: string;
    additional: string;
    place: string;
    processor: string;
    ram: string;
    drive: string;
    power_cable: string;
    needs_additional: boolean;
    recent_actions: string;
    required_action: string;
}

interface InventoryCreationAttr extends Optional<InventoryAttr, 'id'>{}

export class Inventory extends Model<InventoryAttr, InventoryCreationAttr> {
    public id?: number;
    public name: string;
    public description: string;
    public additional: string;
    public place: string;
    public processor: string;
    public ram: string;
    public drive: string;
    public power_cable: string;
    public needs_additional: boolean;
    public recent_actions: string;
    public required_action: string;

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
            description: {
                type: DataTypes.STRING,
                allowNull: false
            },
            additional: {
                type: DataTypes.STRING,
                allowNull: false
            },
            place: {
                type: DataTypes.STRING,
                allowNull: false
            },
            processor: {
                type: DataTypes.STRING,
                allowNull: false
            },
            ram: {
                type: DataTypes.STRING,
                allowNull: false
            },
            drive: {
                type: DataTypes.STRING,
                allowNull: false
            },
            power_cable: {
                type: DataTypes.STRING,
                allowNull: false
            },
            needs_additional: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            },
            recent_actions: {
                type: DataTypes.STRING,
                allowNull: false
            },
            required_action: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }, {
            sequelize,
            timestamps: false,
            freezeTableName: true,
            modelName: 'inventory'
        })
    }

    static getEntries() {
        console.info('searching for inventory items');
        return Inventory.findAll();
    }

    static async add(inventoryData: InventoryAttr) {
        return this.create(inventoryData)
    }
}