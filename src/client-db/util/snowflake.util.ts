import { Logger } from '@nestjs/common';
import { createConnection } from 'snowflake-sdk';
import { IClientDb } from '../client.interface';

export class SnowflakeUtil implements IClientDb {
  private connection: any;

  constructor() {
    this.verifyEnv();

    this.connect();

    // todo: add option for connection pool
  }

  public async getAllTableNames() {
    const query = `select * from SNOWFLAKE_SAMPLE_DATA.TPCH_SF1`;
    const result = await this.queryDB(query);
    console.log(result);
    return result;
  }
  public async getDbMetadataForTables() {}

  public async queryDB(query: string) {
    try {
      const result = await this.connection.execute({
        sqlText: query,
        complete: (err, stmt, rows) => {
          if (err) {
            throw new Error(`Error querying Snowflake: ${err}`);
          }
          return rows;
        },
      });
      console.log(result);

      return result;
    } catch (error) {
      throw new Error(`Error querying Snowflake: ${error.message}`);
    }
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
