import { Injectable } from '@nestjs/common';
import { ProbeType } from './dto/common.dto';
import { RunQueryReqDto, RunQueryResDto } from './dto/query.dto';
import {
  AllTablesResDto,
  DbMetadataReqDto,
  DbMetadataResDto,
} from './dto/tables.dto';
import { BigQueryUtil } from './util/bigquery.util';

@Injectable()
export class AppService {
  private probeType: ProbeType;

  constructor() {
    const probeType = process.env.PROBE_TYPE;

    this.probeType = probeType as ProbeType;

    if (!this.probeType) {
      throw new Error(
        'TYPE environment variable is not set. Please refer .env.sample',
      );
    }
  }

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
