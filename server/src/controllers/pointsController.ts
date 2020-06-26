import { Request, Response } from "express";
import knex from '../database/connection';


class PointsController{
     
    async index(req: Request, res: Response){
        // 3 filters: city, uf and items (grab from Query Params)
        const { city, uf, items} = req.query;

        // parse items:
        // since there might be or not space after the comma
        // we do a map and trim
        const parsedItems = String(items)
        .split(',')
        .map(item => Number(item.trim()));

        const points = await knex('points')
        .join('point_items','points.id','=','point_items.point_id')
        .whereIn('point_items.item_id', parsedItems) //get items filter
        .where('city', String(city)) //whenever you get a query based data use this typescript notation
        .where('uf', String(uf))
        .distinct() // removes the items intersection: A + B - ( A inter B )
        .select('points.*');


        return res.json(points)
    }

    async show(req: Request, res: Response){
        const { id } = req.params;

        // I use first because only one id will be shown with params
        const point = await knex('points')
        .where('id', id)
        .first();

        if(!point){
            return res.status(400).json({ message: 'Point not found...'});
        }

        /* 
            Explaining the join section:
        
        Basically I want all the items that are connected to the specific point
        via the table point_items:

            SELECT * FROM items
            JOIN point_items ON items.id = point_items.item_id
            WHERE point_items.point_id = {id}
        */
        const items = await knex('items')
        .join('point_items', 'items.id', '=', 'point_items.item_id')
        .where('point_items.point_id', id)
        .select('items.title');

        return res.json({point, items});
    }

    async create(req: Request, res: Response){
        const {
            name, 
            email, 
            whatsapp, 
            latitude, 
            longitude, 
            city, 
            uf, 
            items
        } = req.body;
    
        //transaction helps so that the query builder only executes
        // if all the queries worked
    
        const trx = await knex.transaction();
    
    
        const point = { //item not included, because its not a field of points table
            image: 'https://images.unsplash.com/photo-1543364195-077a16c30ff3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
            name, 
            email, 
            whatsapp, 
            latitude, 
            longitude, 
            city, 
            uf 
        }
        // insert has a functionality that returns the id of the inserted OBJECT
        const insertedIds = await trx('points').insert(point);
    
        const point_id = insertedIds[0]
    
        const pointItems = items.map((item_id: number) => {
            return{
                item_id,
                point_id
    
            }
        })
    
        await trx('point_items').insert(pointItems);
    
        await trx.commit();
    
        return res.json({
            id: point_id,
            ...point,
        })
    }

}

export default PointsController;