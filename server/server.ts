import cors from "cors";
import sequelize from "./database/sequelize";

import routerGet from "./routes/GET";
import routerPost from "./routes/POST";

import express, {
   urlencoded, 
   json 
} from "express";

const app = express();

sequelize
  .sync()
  .then(() => {
    console.log("Database synchroniseren");
  })
  .catch((err: unknown) => {
    console.error(err);
  })
  .finally(() => {
    console.log("Database gesynchroniseerd");
  });

app.use(json());
app.use(urlencoded({ extended: false }));

app.use(cors());

app.use("/database", routerGet);
app.use("/backend", routerPost);

const LISTENING_PORT = 8000;

app.listen(LISTENING_PORT, () => {
  console.info(`De server draait op port ${LISTENING_PORT}`);
});
