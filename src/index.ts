import "reflect-metadata";
import {createConnection} from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Request, Response} from "express";
import {Routes} from "./routes";

function handleError(err, req, res, next) {
  res.status(err.statusCode || 500).send({message: err.message})
}

createConnection().then(async connection => {

  // create express app
  const app = express();
  app.use(bodyParser.json());

  // register express routes from defined application routes
  Routes.forEach(route => {
    (app as any)[route.method](route.route, async (req: Request, res: Response, next: Function) => {
      try {
        const result = await (new (route.controller as any))[route.action](req, res, next);
        res.json(result);
      } catch (err) {
        next(err)
      }
    });
  });

  app.use(handleError)
  app.listen(process.env.PORT);

  console.log("Express server has started on port 3000. Open http://localhost:3000/users to see results");

}).catch(error => console.log(error));
