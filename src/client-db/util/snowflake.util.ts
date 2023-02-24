import { Logger } from '@nestjs/common';
import { createConnection } from 'snowflake-sdk';
import { IClientDb } from '../client.interface';
import { uniq } from 'lodash';

import { DbTableMetadataDto } from 'src/dto/db-metadata.dto';
export class SnowflakeUtil implements IClientDb {
  private connection: any;

  constructor() {
    this.verifyEnv();
    this.connect();
  }

  public async getAllTableNames(): Promise<string[]> {
    const query = `
    SHOW TABLES 
    IN ${process.env.SNOWFLAKE_DATABASE}.${process.env.SNOWFLAKE_SCHEMA}`;
    const result = await this.queryDB(query);
    const tableNames = uniq(result.map((r) => r.name));
    return tableNames;
  }

  public async getDbMetadataForTables(): Promise<DbTableMetadataDto[]> {
    // get database metadata for database
    const query = `
      SELECT c.TABLE_CATALOG, c.TABLE_SCHEMA, c.TABLE_NAME, c.COLUMN_NAME, c.DATA_TYPE, c.CHARACTER_MAXIMUM_LENGTH, c.IS_NULLABLE, c.COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.TABLES t
      JOIN INFORMATION_SCHEMA.COLUMNS c
        ON t.TABLE_CATALOG = c.TABLE_CATALOG
        AND t.TABLE_SCHEMA = c.TABLE_SCHEMA
        AND t.TABLE_NAME = c.TABLE_NAME
      WHERE t.TABLE_CATALOG = '${process.env.SNOWFLAKE_DATABASE}' 
      AND t.TABLE_TYPE = 'BASE TABLE' 
      AND t.TABLE_SCHEMA = '${process.env.SNOWFLAKE_SCHEMA}'
      ORDER BY c.TABLE_NAME
    `;
    const result = await this.queryDB(query);

    const tables = this.mapcolumnMDToTableMD(result);

    const res = await this.mapSampleDataToTableMD(tables);

    return res;
  }

  public async queryDB(query: string): Promise<any[]> {
    try {
      const result: any[] = await new Promise((resolve, reject) => {
        this.connection.execute({
          sqlText: query,
          complete: async (err, stmt, rows) => {
            if (err) {
              throw new Error(`Error querying Snowflake: ${err}`);
            }

            resolve(rows);
          },
        });
      });

      return result;
    } catch (error) {
      throw new Error(`Error querying Snowflake: ${error.message}`);
    }
  }

  private async mapSampleDataToTableMD(
    tables: DbTableMetadataDto[],
  ): Promise<DbTableMetadataDto[]> {
    await Promise.all(
      tables.map(async (table) => {
        const sampleData = await this.getSampleData(table.tableName);

        table.columns.map((column) => {
          const sampleDataForColumn = sampleData.map((row) => row[column.name]);
          column.sampleData.push(...sampleDataForColumn);
        });
      }),
    );

    return tables;
  }

  private async getSampleData(tableName: string): Promise<any[]> {
    const query = `SELECT * FROM ${tableName} LIMIT 5;`;
    const result = await this.queryDB(query);
    return result;
  }

  private mapcolumnMDToTableMD(result: any[]): DbTableMetadataDto[] {
    const tables = [];
    result.map((row) => {
      const tableName = row.TABLE_NAME;

      // if table already exists, add column to table
      const table = tables.find((t) => t.tableName === tableName);
      if (table) {
        table.columns.push({
          name: row.COLUMN_NAME,
          type: row.DATA_TYPE,
          sampleData: [],
        });
        return;
      }

      tables.push({
        tableName,
        columns: [
          {
            name: row.COLUMN_NAME,
            type: row.DATA_TYPE,
            sampleData: [],
          },
        ],
      });
    });

    return tables as DbTableMetadataDto[];
  }

  private verifyEnv() {
    if (
      !process.env.SNOWFLAKE_ACCOUNT ||
      !process.env.SNOWFLAKE_USERNAME ||
      !process.env.SNOWFLAKE_PASSWORD ||
      !process.env.SNOWFLAKE_DATABASE ||
      !process.env.SNOWFLAKE_SCHEMA ||
      !process.env.SNOWFLAKE_WAREHOUSE
    ) {
      throw new Error(
        'Snowflake environment variable are not set. Please refer .env.sample',
      );
    }
  }

  private async connect() {
    // todo: add option for connection pool
    const connection = await createConnection({
      account: process.env.SNOWFLAKE_ACCOUNT,
      username: process.env.SNOWFLAKE_USERNAME,
      password: process.env.SNOWFLAKE_PASSWORD,
      database: process.env.SNOWFLAKE_DATABASE,
      schema: process.env.SNOWFLAKE_SCHEMA,
      warehouse: process.env.SNOWFLAKE_WAREHOUSE,
    });

    await connection.connect((err, conn) => {
      if (err) {
        console.log(err);

        throw new Error(`Error connecting to Snowflake: ${err}`);
      }
      this.connection = conn;

      Logger.log('Connected to Snowflake');
    });
  }
}
