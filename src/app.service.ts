import { Injectable } from '@nestjs/common';
import { ProbeType } from './dto/common.dto';
import { RunQueryReqDto, RunQueryResDto } from './dto/query.dto';
import {
  AllTablesResDto,
  DbMetadataReqDto,
  DbMetadataResDto,
} from './dto/tables.dto';
import { BigQueryUtil } from './util/bigquery.util';
import { SnowflakeUtil } from './util/snowflake.util';

@Injectable()
export class AppService {
  private probeType: ProbeType;
  private util: SnowflakeUtil | BigQueryUtil;

  constructor() {
    const probeType = process.env.PROBE_TYPE;

    this.probeType = ProbeType[probeType as keyof typeof ProbeType];

    if (!this.probeType) {
      throw new Error(
        'PROBE_TYPE environment variable is not set. Please refer .env.sample',
      );
    }

    if (this.probeType === ProbeType.BIGQUERY) {
      this.util = new BigQueryUtil();
    } else if (this.probeType === ProbeType.SNOWFLAKE) {
      this.util = new SnowflakeUtil();
    }
  }

  public async getAllTableNames() { // : Promise<AllTablesResDto>
    const tableNames = await this.util.getAllTableNames();

    return { tableNames };
  }

  public async getDbMetadata(
    reqDto: DbMetadataReqDto, // : Promise<DbMetadataResDto>
  ) {
    const metadata = await this.util.getDbMetadataForTables(reqDto.tableNames);

    return { metadata };
  }

  public async runQuery(
    reqDto: RunQueryReqDto, // : Promise<RunQueryResDto>
  ) {
    try {
      const queryResults = await this.util.queryDB(reqDto.query);

      return { status: 'success', queryResults };
    } catch (error) {
      return { status: 'failed', error: error.message };
    }
  }
}
