import { Injectable } from '@nestjs/common';
import { RunQueryReqDto, RunQueryResDto } from './dto/query.dto';
import {
  AllTablesResDto,
  DbMetadataReqDto,
  DbMetadataResDto,
} from './dto/tables.dto';
import { ClientFactory } from './client-db/client.factory';
import { IClientDb } from './client-db/client.interface';

@Injectable()
export class AppService {
  private readonly clientDb: IClientDb;
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
