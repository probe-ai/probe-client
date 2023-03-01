import { DbTableMetadataDto } from 'src/dto/db-metadata.dto';
import { ElasticSearchQueryDto } from 'src/dto/query.dto';

export interface IClientDb {
  getAllTableNames(): Promise<string[]>;

  getDbMetadataForTables(tableNames: string[]): Promise<DbTableMetadataDto[]>;

  queryDB(query: string | ElasticSearchQueryDto): Promise<any[]>;
}
