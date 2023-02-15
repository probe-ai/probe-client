import { BigQuery } from '@google-cloud/bigquery';
import { uniq } from 'lodash';
import { DbTableMetadataDto } from 'src/dto/db-metadata.dto';
import { ArrayUtil } from './array.util';

export class BigQueryUtil {
  private static readonly BIGQUERY_CONFIG_PATH = '/usr/src/app/bigquery.json';

  public static async getAllTableNames(): Promise<string[]> {
    const bigquery = new BigQuery({
      keyFilename: this.BIGQUERY_CONFIG_PATH,
    });

    const query = `SELECT
      table_name
    FROM
      \`${process.env.BIGQUERY_PROJECT}.${process.env.BIGQUERY_DATASET}\`.INFORMATION_SCHEMA.COLUMNS;`;

    const options = {
      query: query,
      location: process.env.BIGQUERY_PROJECT_LOCATION,
    };

    const [rows] = await bigquery.query(options);

    return uniq(rows.map((r) => r.table_name));
  }

  public static async getDbMetadataForTables(
    tableNames: string[],
  ): Promise<DbTableMetadataDto[]> {
    const bigquery = new BigQuery({
      keyFilename: this.BIGQUERY_CONFIG_PATH,
    });

    const query = `SELECT
      table_name,
      column_name,
      data_type,
    FROM
      \`${process.env.BIGQUERY_PROJECT}.${
      process.env.BIGQUERY_DATASET
    }\`.INFORMATION_SCHEMA.COLUMNS
    WHERE
      table_name in (${tableNames.join()});`;

    const options = {
      query: query,
      location: process.env.BIGQUERY_PROJECT_LOCATION,
    };

    const [rows] = await bigquery.query(options);

    return BigQueryUtil.toDbMetadataDto(rows);
  }

  private static async toDbMetadataDto(
    rows: any[],
  ): Promise<DbTableMetadataDto[]> {
    const nameToMetadataList = ArrayUtil.toHashMapArrays(
      rows,
      (r) => r.table_name,
    );

    const metadata: DbTableMetadataDto[] = [];

    for await (const [tableName, metadataList] of Object.entries(
      nameToMetadataList,
    )) {
      const sampleData = await this.getSampleData(tableName, 2);

      metadata.push({
        tableName,
        columns: metadataList.map((m) => ({
          name: m.column_name,
          type: m.data_type,
          sampleData: sampleData.map((d) => String(d[m.column_name])),
        })),
      });
    }

    return metadata;
  }

  private static async getSampleData(
    tableName: string,
    rowCount: number,
  ): Promise<Record<string, any>[]> {
    const bigquery = new BigQuery({
      keyFilename: this.BIGQUERY_CONFIG_PATH,
    });

    const query = `SELECT * FROM ${process.env.BIGQUERY_PROJECT}.${process.env.BIGQUERY_DATASET}.${tableName} limit ${rowCount};`;

    const options = {
      query: query,
      location: process.env.BIGQUERY_PROJECT_LOCATION,
    };

    const [rows] = await bigquery.query(options);

    return rows;
  }

  public static async queryDB(query: string): Promise<any[]> {
    const bigquery = new BigQuery({
      keyFilename: this.BIGQUERY_CONFIG_PATH,
    });

    const options = {
      query: query,
      location: process.env.BIGQUERY_PROJECT_LOCATION,
    };
    const result = await bigquery.query(options);

    return result[0];
  }
}
