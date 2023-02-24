import { DbTableMetadataDto } from 'src/dto/db-metadata.dto';

export interface IClientDb {
  getAllTableNames(): Promise<string[]>;

  getDbMetadataForTables(tableNames: string[]): Promise<DbTableMetadataDto[]>;

  queryDB(query: string): Promise<any[]>;
}
