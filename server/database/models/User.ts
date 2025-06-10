import { DataTypes, Model, Optional } from "sequelize";
import * as argon from "argon2";
import {v4 as uuidv4} from "uuid";

interface UserAttr {
    id?: number;
    username: string;
    password: string;
    session_id?: string;
    permission_level?: number
}

interface UserCreationAttr extends Optional<UserAttr, 'id'>{}

export class User extends Model<UserAttr, UserCreationAttr> {
    public id?: number;
    public username: string | undefined;
    public password: string | undefined;
    public session_id?: string;
    public permission_level?: number;

    static initModel(sequelize: any) {
        super.init({
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: true
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            session_id: {
                type: DataTypes.STRING,
                allowNull: true
            },
            permission_level: {
                type: DataTypes.INTEGER,
                allowNull: true
            }
        }, {
            sequelize,
            timestamps: false,
            freezeTableName: true,
            modelName: 'users'
        })
    }

    static findUser(username: string): Promise<User | null> {
        return this.findOne({where: {
            username: username
        }})
    }

    static async register(data: UserAttr): Promise<User | boolean> {
        if (await this.findUser(data.username)) return false;
        const user = await this.create({
            username: data.username,
            password: await argon.hash(data.password),
            permission_level: 0
        })
        if (user == null) return false;
        return user;
    }

    static async login(username: string, password: string): Promise<boolean> {
        const user = await this.findUser(username)
        if (!user) return false;

        const hashedPassword = await this.getHashedPassword(username) as string;
        const comparePasswordToHash = await argon.verify(hashedPassword, password)   
        if (!comparePasswordToHash) return false;
    
        const sessionId = await this.createSessionIdentifier(username);
        return !!sessionId;
    }

    static async getHashedPassword(username: string): Promise<string | boolean> {
        const user = await this.findUser(username)
        if (!user) return false;
        return user.password as string;
    }

    static async createSessionIdentifier(username: string): Promise<string | false> {
        const user = await this.findUser(username);
        if (!user) return false;

        const ID = uuidv4();
        const updated = user.update({session_id: ID});
        if (!updated) return false;

        return ID;
    }

    static async getUser(username: string): Promise<boolean | User> {
        const user = await this.findUser(username)
        if (!user) return false;
        return user;
    }

    static async getPermissionLevel(username: string): Promise<number | boolean> {
        const user = await this.findUser(username)
        if (!user) return false;
        return user.permission_level as number
    }

    static async setPermissionLevel(username: string, permission_level: number): Promise<boolean> {
        const user = await this.findUser(username)
        if (!user) return false;
        const updated = user.update({permission_level})
        return !!updated;
    }
}