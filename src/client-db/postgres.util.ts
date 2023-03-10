import { Logger } from '@nestjs/common';
import { Pool } from 'pg';
import { DbTableMetadataDto } from 'src/dto/db-metadata.dto';
import { IClientDb } from './client.interface';
import * as moment from 'moment';

export class PostgresUtil implements IClientDb {
  private readonly logger = new Logger(PostgresUtil.name);

  private pool: Pool;

  constructor() {
    this.verify();

    try {
      this.pool = new Pool({
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        port: parseInt(process.env.POSTGRES_PORT),
      });
      this.logger.log(`Postgres connected successfully`);
    } catch (err) {
      this.logger.log(`Error connecting to Postgres: ${err.message}`);
    }
  }

  public async getAllTableNames(): Promise<string[]> {
    const query = `SELECT
      table_name
    FROM
        information_schema.tables
    WHERE
        table_schema = 'public';`;

    const result = await this.queryDB(query);
    return result.map((row) => row.table_name);
  }

  public async getDbMetadataForTables(): Promise<DbTableMetadataDto[]> {
    // ignore system tables
    const query = `SELECT
      table_name,
      column_name,
      data_type
      FROM
        information_schema.columns
      WHERE
        table_schema = 'public'
      AND
        table_name NOT LIKE 'pg_%'
      AND
        table_name NOT LIKE 'sql_%'
      AND
        table_name NOT LIKE 'Sequelize%';`;

    const result = await this.queryDB(query);

    const resWithoutData = await this.mapTableMetadata(result);

    return this.mapSampleData(resWithoutData);
  }

  public async queryDB(query: string): Promise<any[]> {
    try {
      const result: any[] = await new Promise((resolve, reject) => {
        this.pool.query(query, (err, res) => {
          if (err) {
            throw new Error(`Error querying Postgres: ${err}`);
          }

          resolve(res.rows);
        });
      });

      return result;
    } catch (err) {
      throw new Error('Error querying Postgres: ' + err.message);
    }
  }

  private async mapTableMetadata(result: any[]): Promise<DbTableMetadataDto[]> {
    const tableMetadata: DbTableMetadataDto[] = [];

    result.map((row) => {
      const table = tableMetadata.find(
        (table) => table.tableName === row.table_name,
      );

      if (table) {
        table.columns.push({
          name: row.column_name,
          type: row.data_type,
          sampleData: [],
        });
      } else {
        tableMetadata.push({
          tableName: row.table_name,
          columns: [
            {
              name: row.column_name,
              type: row.data_type,
              sampleData: [],
            },
          ],
        });
      }
    });

    return tableMetadata;
  }

  private async mapSampleData(
    result: DbTableMetadataDto[],
  ): Promise<DbTableMetadataDto[]> {
    await Promise.all(
      result.map(async (table) => {
        const query = `SELECT * FROM "${table.tableName}" LIMIT 2;`;
        const sampleData = await this.queryDB(query);

        table.columns.map((column) => {
          column.sampleData.push(
            ...sampleData.map((d) => {
              if (column.type === 'date') {
                return moment(d[column.name]).format('YYYY-MM-DD');
              } else if (column.type.startsWith('time')) {
                return moment(d[column.name]).format('YYYY-MM-DD HH:mm:ss.SSS');
              } else if (['array', 'json', 'jsonb'].includes(column.type)) {
                return JSON.stringify(d[column.name]);
              } else {
                return String(d[column.name]);
              }
            }),
          );
        });
      }),
    );

    return result;
  }

  private async verify(): Promise<void> {
    if (
      !process.env.POSTGRES_USER ||
      !process.env.POSTGRES_HOST ||
      !process.env.POSTGRES_DB ||
      !process.env.POSTGRES_PASSWORD ||
      !process.env.POSTGRES_PORT
    ) {
      throw new Error(
        'Postgres config not found. Please refer .env.sample for more details',
      );
    }
  }
}
