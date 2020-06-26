import Knex from 'knex'

/* 
Whenever you want to get a type of an import, 
you use the first letter of the word in Uppercase, that will not import 
the library, but only it's type, which is what we want
*/

export async function up(knex: Knex) {
    //create table
     return knex.schema.createTable('items', table => {
        table.increments('id').primary; //primary key of our table
        table.string('image').notNullable;
        table.string('title').notNullable;
    })
}

export async function down(knex: Knex){
    //delete table
    return knex.schema.dropTable('items')
}