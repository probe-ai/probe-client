export interface DbColumnMetadataDto {
  readonly name: string;

  readonly type: string;

  readonly sampleData: string[];
}

export interface DbTableMetadataDto {
  readonly tableName: string;

  readonly columns: DbColumnMetadataDto[];
}
