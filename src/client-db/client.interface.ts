import { DbMetadataReqDto } from 'src/dto/tables.dto';

//todo: add return types
export interface IClientDb {
  getAllTableNames();

  getDbMetadataForTables(reqDto: DbMetadataReqDto);

  queryDB(query: string);
}
