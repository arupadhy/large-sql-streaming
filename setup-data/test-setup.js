import faker from 'faker';
const { name } = faker;

export class TestSetup {
    constructor(dbPool, poolWithDb) {
        this.pool = dbPool;
        this.poolWithDb = poolWithDb;
    }

    async cleanup() {
        try {
            console.log('cleaning up database');
            await this.pool.promise().execute(`drop database test`);
        }catch(err) {
            throw err;
        }
    }

    async setup() {
        try {
            // await this.pool.promise().execute(`create database test`);
            // await this.poolWithDb.promise().execute(`create table users(
            //     name text not null,
            //     id bigint not null auto_increment,
            //     age int not null,
            //     primary key(id)
            // );`);
            await this.addEntries();
        }catch(err) {
            console.log(err);
            process.exit(1);
        }
    }

    async addEntries(count=500000000) {
        console.log('Adding entries to users table');
        const promises = [];
        for(let batch = 1; batch <= count/10000; batch++) {
            await this.bulkInsert();
            console.log(`~~~~~ Completed setup of 10000 entries to users table ~~~~~`);
        }
    }

    async bulkInsert(limit = 10000) {
        const values = [];
        for(let count = 0; count<limit; count++) {
            values.push([name.findName(), Math.ceil(Math.random()* 30)]);
        }
        await this.poolWithDb.promise().query(`insert into users (name, age) values ?`, [values]);

    }
}