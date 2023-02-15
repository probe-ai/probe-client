import { Injectable } from '@nestjs/common';
import { RunQueryReqDto, RunQueryResDto } from './dto/query.dto';
import {
  AllTablesResDto,
  DbMetadataReqDto,
  DbMetadataResDto,
} from './dto/tables.dto';
import { BigQueryUtil } from './util/bigquery.util';

@Injectable()
export class AppService {
  public async getAllTableNames(): Promise<AllTablesResDto> {
    const tableNames = await BigQueryUtil.getAllTableNames();

    return { tableNames };
  }

  public async getDbMetadata(
    reqDto: DbMetadataReqDto,
  ): Promise<DbMetadataResDto> {
    const metadata = await BigQueryUtil.getDbMetadataForTables(
      reqDto.tableNames,
    );

    return { metadata };
  }

  public async runQuery(reqDto: RunQueryReqDto): Promise<RunQueryResDto> {
    try {
      const queryResults = await BigQueryUtil.queryDB(reqDto.query);

      return { status: 'success', queryResults };
    } catch (error) {
      return { status: 'failed', error: error.message };
    }
  }
}
