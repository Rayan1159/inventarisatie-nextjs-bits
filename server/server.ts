import { application, urlencoded } from "express";
import { Login } from "../src/layout/Login";
import sequelize from "./database/sequelize";
import path from "path";
import cors from "cors";
import * as fs from "fs";
import React from "react";
import "react-dom/server";
//init express
const app = application;

sequelize
  .sync()
  .then(() => {
    console.log("Database synchroniseren");
  })
  .catch((err) => {
    console.error(err);
  })
  .finally(() => {
    console.log("Database gesynchroniseerd");
  });

app.use(qpp.json());
app.use(app.urlencoded({ extended: false }));

app.use(cors());

app.use("/backend");
app.use("/database");


const LISTENING_PORT = 8000;

app.listen(LISTENING_PORT, () => {
  console.info(`De server draait op port ${LISTENING_PORT}`);
});
