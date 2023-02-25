import { Logger } from '@nestjs/common';
import { BigQueryUtil } from 'src/client-db/bigquery.util';
import { SnowflakeUtil } from 'src/client-db/snowflake.util';
import { MySQLUtil } from './mysql.util';
import { PostgresUtil } from './postgres.util';

export abstract class ClientFactory {
  public static getClientDb() {
    if (process.env.BIGQUERY_PROJECT) {
      return new BigQueryUtil();
    }
    if (process.env.SNOWFLAKE_ACCOUNT) {
      return new SnowflakeUtil();
    }
    if (process.env.POSTGRES_HOST) {
      return new PostgresUtil();
    }
    if (process.env.MYSQL_HOST) {
      return new MySQLUtil();
    }
    throw new Error('No client DB found. Please refer README.md');
  }
}
