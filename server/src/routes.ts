import express from "express";

import PointsController from './controllers/pointsController';
import ItemsController from "./controllers/itemsController";

// creating instances
const routes = express.Router() //separates routes from express server
const pointsController = new PointsController();
const itemsController = new ItemsController();

routes.get('/items', itemsController.index)

routes.post('/points', pointsController.create);
routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show);

export default routes;