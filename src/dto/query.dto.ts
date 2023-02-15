import { ResDto } from './common.dto';

export interface RunQueryReqDto {
  readonly query: string;
}

export interface RunQueryResDto extends ResDto {
  readonly queryResults?: any[];
}
