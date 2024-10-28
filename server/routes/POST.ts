import { Router }  from "express";
import { User } from "../database/models/User";
import { Inventory } from "../database/models/Inventory";
import sequelize from "../database/sequelize";
import { permissionLevel } from '../enums/permissions'
import {Request, Response, NextFunction} from "express";
import { InventoryAttr } from "../database/models/Inventory";

const router = Router();
User.initModel(sequelize)
Inventory.initModel(sequelize);

router.post('/user/login', async (req: Request, res: Response, next: NextFunction) => {
    const {username, password} = req.body;  
    if (!username || !password) return res.status(400).json({
        error: 'Username and password are required'
    });

    const loggedIn = await User.login(username, password);
    if (loggedIn) {
        const {username, session_id} = await User.getUser(req.body.username) as User;
        if (!session_id) await User.createSessionIdentifier(username as string)
        res.status(200).json({
            loggedIn: true,
            userObj: {
                username,
                session_id : session_id ? session_id : "error when setting session_id"
            }
        })
    } else {
        res.status(401).json({
            loggedIn: false
        });
    }
})

router.post('/user/exists', async (req: Request, res: Response, next: NextFunction) => {
    const {username} = req.body;
    const exists = await User.findUser(username);

    res.status(200).json({
        exists: !!exists
    })
})


router.post('/entry/create', async (req, res, _next) => {
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
        return;
    }
})

export default router;
