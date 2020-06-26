import Knex from 'knex'

/* 
Whenever you want to get a type of an import, 
you use the first letter of the word in Uppercase, that will not import 
the library, but only it's type, which is what we want
*/

export async function up(knex: Knex) {
    //create table
     return knex.schema.createTable('point_items', table => {
        table.increments('id').primary; //primary key of our table

        table.integer('point_id')
          .notNullable()
          .references('id') // get element
          .inTable('points'); //from table
        table.integer('item_id')
          .notNullable()
          .references('id')
          .inTable('items');
    })
}

export async function down(knex: Knex){
    //delete table
    return knex.schema.dropTable('point_items')
}