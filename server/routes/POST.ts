import sequelize from "../database/sequelize";
import { Router }  from "express";
import { User } from "../database/models/User";
import { Inventory } from "../database/models/Inventory";
import { permissionLevel } from '../enums/permissions'
import { InventoryAttr } from "../database/models/Inventory";

const routerPost = Router();
User.initModel(sequelize)
Inventory.initModel(sequelize);

routerPost.post('/entry/create', async (req, res, _next) => {
    const permissionInt = await User.getPermissionLevel(req.body.username) as number;
    if (!permissionInt) {
        return res.status(500).json({
            error: 1
        })
    }

    if (permissionInt > permissionLevel.USER) {
        req.body.forEach((item: InventoryAttr) => {
            Inventory.add(item);
        })
        return;
    }
   
    if (permissionInt < permissionLevel.ADMIN) {
        res.status(500).json({
            error: "onjuist permissie level"
        })
    }
})

export default routerPost;
