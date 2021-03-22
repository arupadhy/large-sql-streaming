import {  createPool } from 'mysql2';
import { createPool as createSqlPool } from 'mysql';
import { PassThrough, pipeline, Transform } from 'stream';
import { promisify } from 'util';
import { createWriteStream } from 'fs';
import { TestSetup } from './setup-data/test-setup.js';

const QUERY_FROM_LARGE_TABLE = 'select name, id, age from users';
const wait = promisify(setTimeout);
const pump = promisify(pipeline);
const LOCAL_CSV_FILE = './results.csv';
const delayTime = [1,2,3,4,5,10,10,100,300];


// use this for testing the speed
async function *fastSource(delay) {
    while(true) {
        await wait(delay);
        yield {};
    }
}

async function delayedCall(data) {
    const randomDelay = delayTime[Math.floor(Math.random() * delayTime.length)];
    await wait(1);
    console.log(`I am slow consumer and waited for ${randomDelay} msec for ${JSON.stringify(data)}`);
    return data;
}

function getDbPool() {
    const config = {
        host: process.env.HOST || '127.0.0.1',
        user: 'root',
        password: process.env.PASSWORD || 'password',
        port: process.env.PORT || 3310,
      };
    console.log('============= ENV VARS =============');
    console.log(process.env);
  return { pool: createPool(config), poolWithDb: createPool({
      ...config, database: 'test'}) };
}

async function streamLargeData() {
    const { poolWithDb } = getDbPool();
    const source = poolWithDb.query(QUERY_FROM_LARGE_TABLE).stream({objectMode: true});
    const destination = createWriteStream(LOCAL_CSV_FILE);
    
    destination.write('Name, ID, Age \r\n');
    console.log(`Starting streaming of large dataset`);
    try {
        await pump(
            source,
            new Transform({
                objectMode: true,
                transform: (row, enc, cb) => {
                    delayedCall(row)
                    .then(data => {
                        cb(null, [data.name, data.id, data.age].join(',')+'\r\n');
                    })
                    .catch(err => {
                        cb(err);
                    })
                }
            }),
            destination
        );
        console.log('Finished streaming of large data successfully');
    }catch(err) {
        console.log(err);
        process.exit(1);
    }
}

async function simulateLargeDataStream() {
    const { pool, poolWithDb } = getDbPool();
    const testSetup = new TestSetup(pool, poolWithDb);
    
    // this cleans up data from mysql table
    // await testSetup.cleanup();

   // this setups data in the mysql table that would be queried
    await testSetup.setup();
  
   // this will stream the data with some artificial delay
    await streamLargeData();
}

// this while running on the container
 simulateLargeDataStream();

