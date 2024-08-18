import postgres from 'postgres'
import "dotenv/config"
import { singleton } from 'tsyringe';
import fs from "fs";
import path from "path";

const sql = postgres({
    port: parseInt(process.env.DATABASE_PORT ?? "5432"),
    host: process.env.DATABASE_IP,
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD
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
            port: parseInt(process.env.DATABASE_PORT ?? "5432"),
            host: process.env.DATABASE_IP,
            database: process.env.DATABASE_NAME,
            username: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD
        }) : undefined;
    }
    private hasRequireEnvironnementVariables(){
        return (
            process.env.DATABASE_PORT != undefined &&
            process.env.DATABASE_IP != undefined &&
            process.env.DATABASE_NAME != undefined &&
            process.env.DATABASE_USER != undefined &&
            process.env.DATABASE_PASSWORD != undefined
        );
    }

}
