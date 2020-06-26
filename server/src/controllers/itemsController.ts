import { Request, Response } from "express";
import knex from '../database/connection';


class ItemController{
    async index(req: Request, res: Response){

        // query
        const items = await knex('items').select('*');
    
        const serializedItems = items.map(item => {
            return {
                id: item.id,
                title: item.title,
                image_url: `http://192.168.0.19:8080/uploads/${item.image}`, 
            }
        })
    
        return res.json(serializedItems)
    }
}

export default ItemController;