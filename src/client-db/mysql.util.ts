import { Connection } from 'mysql';
import * as mysql from 'mysql';
import { DbTableMetadataDto } from 'src/dto/db-metadata.dto';
import { IClientDb } from './client.interface';
import { Logger } from '@nestjs/common';

export class MySQLUtil implements IClientDb {
  private connection: Connection;

  constructor() {
    this.verify();
    this.connect();
  }

  public async getAllTableNames(): Promise<string[]> {
    const query = `SELECT table_name FROM information_schema.tables WHERE table_schema = '${process.env.MYSQL_DB}'`;
    const result = await this.queryDB(query);
    return result.map((row) => row.table_name);
  }

  public async getDbMetadataForTables(): Promise<DbTableMetadataDto[]> {
    const query = `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE FROM information_schema.columns WHERE table_schema = '${process.env.MYSQL_DB}'`;
    const result = await this.queryDB(query);

    const tables = this.mapcolumnMDToTableMD(result);

    const res = await this.mapSampleDataToTableMD(tables);

    return res;
  }

  public async queryDB(query: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.connection.query(query, (error, results, fields) => {
        if (error) {
          throw new Error(`Error querying MySQL: ${error}`);
        }
        resolve(results);
      });
    });
  }

  private mapcolumnMDToTableMD(result: any[]): DbTableMetadataDto[] {
    const tables: DbTableMetadataDto[] = [];
    result.forEach((row) => {
      const table = tables.find((t) => t.tableName === row.TABLE_NAME);
      if (table) {
        table.columns.push({
          name: row.COLUMN_NAME,
          type: row.DATA_TYPE,
          sampleData: [],
        });
      } else {
        tables.push({
          tableName: row.TABLE_NAME,
          columns: [
            {
              name: row.COLUMN_NAME,
              type: row.DATA_TYPE,
              sampleData: [],
            },
          ],
        });
      }
    });
    return tables;
  }

  private async mapSampleDataToTableMD(
    tables: DbTableMetadataDto[],
  ): Promise<DbTableMetadataDto[]> {
    const promises = tables.map(async (table) => {
      const query = `SELECT * FROM ${table.tableName} LIMIT 2`;
      const result = await this.queryDB(query);

      table.columns.forEach((column) => {
        column.sampleData.push(...result.map((row) => row[column.name]));
      });
      return table;
    });

    return Promise.all(promises);
  }

  private verify() {
    if (
      !process.env.MYSQL_HOST ||
      !process.env.MYSQL_USER ||
      !process.env.MYSQL_PASSWORD ||
      !process.env.MYSQL_DB ||
      !process.env.MYSQL_PORT
    ) {
      throw new Error(
        'MySQL environment variable are not set. Please refer .env.sample',
      );
    }
  }

  private async connect() {
    try {
      this.connection = mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DB,
        port: parseInt(process.env.MYSQL_PORT),
      });
      this.connection.connect((error) => {
        if (error) {
          throw new Error(`Error connecting to MySQL: ${error}`);
        }

        Logger.log('Connected to MySQL');
      });
    } catch (error) {
      throw new Error(`Error connecting to MySQL: ${error}`);
    }
  }
}
