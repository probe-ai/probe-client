import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { ResDto } from './common.dto';

export interface RunQueryReqDto {
  readonly query: string;
}

export interface RunQueryResDto extends ResDto {
  readonly queryResults?: any[];
}

export interface ElasticSearchQueryDto {
  readonly query: QueryDslQueryContainer;

  readonly size?: number | null;

  readonly index: string;
}
