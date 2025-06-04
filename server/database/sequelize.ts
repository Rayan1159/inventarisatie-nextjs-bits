import { Sequelize as database } from "sequelize";
import * as pino from "pino";

const p = pino.default({
  level: "info",
});

const sequelize = new database("inv", "bits", "admin", {
host: "localhost",
  port: 3306,
  dialect: "mysql",
  logging: p.info.bind(p),
});

sequelize
  .authenticate()
  .then(() => {
    console.info("Verbinding met de database is actief");
  })
  .catch((err) => {
    console.log(err);
  });


export default sequelize;
