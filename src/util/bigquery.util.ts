import { BigQuery } from '@google-cloud/bigquery';
import { uniq } from 'lodash';
import { DbTableMetadataDto } from 'src/dto/db-metadata.dto';
import { ArrayUtil } from './array.util';
import fs from 'fs';

export class BigQueryUtil {
  private readonly BIGQUERY_CONFIG_PATH = '/usr/src/app/bigquery.json';

  constructor() {
    // verify bigquery config file
    if (fs.existsSync(this.BIGQUERY_CONFIG_PATH)) {
      throw new Error('BigQuery config file not found. Please refer README.md');
    }
  }

  public async getAllTableNames(): Promise<string[]> {
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

  public async getDbMetadataForTables(
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

    return this.toDbMetadataDto(rows);
  }

  private async toDbMetadataDto(rows: any[]): Promise<DbTableMetadataDto[]> {
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

  private async getSampleData(
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

  public async queryDB(query: string): Promise<any[]> {
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
