import postgres from 'postgres'
import "dotenv/config"
import { singleton } from 'tsyringe';
import fs from "fs";
import path from "path";

const sql = postgres({
    port: parseInt(process.env.PG_PORT ?? "5432"),
    host: process.env.PG_IP,
    database: process.env.PG_NAME,
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD
})
export {sql};

@singleton()
export class DatabaseService{
    sql : postgres.Sql | undefined;
    constructor(){
        this.sql = this.initConnection();
    }
    async call(directory: string, fileName: string, args: Array<any>){
        return sql.file(`./server/services/database-service/calls/${directory}/${fileName}.sql`, args)
    }
    private initConnection(){
        return this.hasRequireEnvironnementVariables() ? postgres({
            port: parseInt(process.env.PG_PORT ?? "5432"),
            host: process.env.PG_IP,
            database: process.env.PG_NAME,
            username: process.env.PG_USER,
            password: process.env.PG_PASSWORD
        }) : undefined;
    }
    private hasRequireEnvironnementVariables(){
        return (
            process.env.PG_PORT != undefined &&
            process.env.PG_IP != undefined &&
            process.env.PG_NAME != undefined &&
            process.env.PG_USER != undefined &&
            process.env.PG_PASSWORD != undefined
        );
    }

}
