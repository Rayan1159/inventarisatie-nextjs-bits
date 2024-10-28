import { application, urlencoded, json } from "express";
import sequelize from "./database/sequelize";
import cors from "cors";
import "react-dom/server";

const app = application;

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

app.use("/backend");
app.use("/database");


const LISTENING_PORT = 8000;

app.listen(LISTENING_PORT, () => {
  console.info(`De server draait op port ${LISTENING_PORT}`);
});
