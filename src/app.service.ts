import { Injectable } from '@nestjs/common';
import { ProbeType } from './dto/common.dto';
import { RunQueryReqDto, RunQueryResDto } from './dto/query.dto';
import {
  AllTablesResDto,
  DbMetadataReqDto,
  DbMetadataResDto,
} from './dto/tables.dto';
import { BigQueryUtil } from './client-db/util/bigquery.util';
import { SnowflakeUtil } from './client-db/util/snowflake.util';
import { ClientFactory } from './client-db/client.factory';

@Injectable()
export class AppService {
  private readonly clientDb: BigQueryUtil | SnowflakeUtil;
  constructor() {
    this.clientDb = ClientFactory.getClientDb();
  }

  public async getAllTableNames(): Promise<AllTablesResDto> {
    const tableNames = await this.clientDb.getAllTableNames();

    return { tableNames };
  }

  public async getDbMetadata(
    reqDto: DbMetadataReqDto,
  ): Promise<DbMetadataResDto> {
    const metadata = await this.clientDb.getDbMetadataForTables(
      reqDto.tableNames,
    );

    return { metadata };
  }

  public async runQuery(reqDto: RunQueryReqDto): Promise<RunQueryResDto> {
    try {
      const queryResults = await this.clientDb.queryDB(reqDto.query);

      return { status: 'success', queryResults };
    } catch (error) {
      return { status: 'failed', error: error.message };
    }
  }
}
