export interface ResDto {
  status: 'success' | 'failed';
  msg?: string;
  error?: string;
}

export enum ProbeType {
  SNOWFLAKE = 'snowflake',
  BIGQUERY = 'bigquery',
}
