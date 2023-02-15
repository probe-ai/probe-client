import { DbTableMetadataDto } from './db-metadata.dto';

export interface AllTablesResDto {
  tableNames: string[];
}

export interface DbMetadataReqDto {
  tableNames: string[];
}

export interface DbMetadataResDto {
  metadata: DbTableMetadataDto[];
}
