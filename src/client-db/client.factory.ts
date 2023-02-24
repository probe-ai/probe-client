import { BigQueryUtil } from 'src/client-db/bigquery.util';
import { SnowflakeUtil } from 'src/client-db/snowflake.util';

export abstract class ClientFactory {
  public static getClientDb() {
    if (process.env.BIGQUERY_PROJECT) {
      return new BigQueryUtil();
    }
    if (process.env.SNOWFLAKE_ACCOUNT) {
      return new SnowflakeUtil();
    }
    throw new Error('No client DB found. Please refer README.md');
  }
}
