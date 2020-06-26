import Knex from 'knex'

/* 
Whenever you want to get a type of an import, 
you use the first letter of the word in Uppercase, that will not import 
the library, but only it's type, which is what we want
*/
export async function up(knex: Knex) {
    //create table
     return knex.schema.createTable('points', table => {
        table.increments('id').primary; //primary key of our table
        table.string('image').notNullable;
        table.string('name').notNullable;
        table.string('email').notNullable;
        table.string('whatsapp').notNullable;
        table.decimal('latitude').notNullable;
        table.decimal('longitude').notNullable;
        table.string('city').notNullable;
        table.string('uf', 2).notNullable;
    })
}

export async function down(knex: Knex){
    //delete table
    return knex.schema.dropTable('points')
}