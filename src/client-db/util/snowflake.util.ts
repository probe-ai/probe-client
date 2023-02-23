import { Logger } from '@nestjs/common';
import { createConnection } from 'snowflake-sdk';
import { IClientDb } from '../client.interface';

export class SnowflakeUtil implements IClientDb {
  private connection: any;

  constructor() {
    this.verifyEnv();

    // todo: add option for connection pool
    try {
      this.connection = createConnection({
        account: process.env.SNOWFLAKE_ACCOUNT,
        username: process.env.SNOWFLAKE_USERNAME,
        password: process.env.SNOWFLAKE_PASSWORD,
        database: process.env.SNOWFLAKE_DATABASE,
        schema: process.env.SNOWFLAKE_SCHEMA,
        warehouse: process.env.SNOWFLAKE_WAREHOUSE,
      });
    } catch (error) {
      throw new Error(`Error connecting to Snowflake: ${error.message}`);
    }
  }

  public async getAllTableNames() {}
  public async getDbMetadataForTables() {}
  public async queryDB() {}

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
}
