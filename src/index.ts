import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { Routes } from "./routes";
import { PORT } from "./config";
import * as morgan from "morgan";

function handleError(err, req, res, next) {
  res.status(err.statusCode || 500).send({ message: err.message });
}

createConnection()
  .then(async (connection) => {
    const app = express();
    app.use(morgan("tiny"));
    app.use(bodyParser.json());

    await connection.runMigrations();

    Routes.forEach((route) => {
      (app as any)[route.method](
        route.route,
        async (req: Request, res: Response, next: Function) => {
          try {
            const result = await new (route.controller as any)()[route.action](
              req,
              res,
              next
            );
            res.json(result);
          } catch (err) {
            next(err);
          }
        }
      );
    });

    app.use(handleError);
    app.listen(PORT);

    console.log(`Express server has started on port ${PORT}.`);
  })
  .catch((error) => console.log(error));
