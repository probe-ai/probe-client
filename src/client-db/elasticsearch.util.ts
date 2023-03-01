import { Client } from '@elastic/elasticsearch';
import {
  QueryDslQueryContainer,
  SearchRequest,
} from '@elastic/elasticsearch/lib/api/types';
import { DbTableMetadataDto } from 'src/dto/db-metadata.dto';
import { ElasticSearchQueryDto } from 'src/dto/query.dto';
import { IClientDb } from './client.interface';

export class ElasticSearchUtil implements IClientDb {
  private esClient: Client;

  constructor() {
    this.verify();
    this.connect();
  }

  public async getAllTableNames(): Promise<string[]> {
    const response = await this.esClient.cat.indices({ format: 'json' });
    // ignore
    const result = response.filter((index) => !index.index.startsWith('.'));
    return result.map((index) => index.index);
  }

  public async getDbMetadataForTables(): Promise<DbTableMetadataDto[]> {
    // ignore system indices
    const response = await this.esClient.indices.getMapping({
      index: '_all',
    });

    // ignore system indices
    const result = Object.keys(response).filter(
      (index) => !index.startsWith('.'),
    );

    const indices_ = {};

    await Promise.all(
      result.map((index) => {
        indices_[index] = response[index];
      }),
    );

    const indices = this.mapcolumnMDToTableMD(indices_);

    const res = await this.mapSampleDataToTableMD(indices);

    return res;
  }

  public async queryDB(query: ElasticSearchQueryDto): Promise<any> {
    //todo: query is of diffrent format for elastic search
    const response = await this.esClient.search({
      index: query.index,
      query: query.query,
      ...(query.size && { size: query.size }),
    });
    return response.hits.hits;
  }

  private mapcolumnMDToTableMD(result: any): DbTableMetadataDto[] {
    const indexFieldMap = [];

    Object.keys(result).map((indexName) => {
      const indexMappings = result[indexName].mappings;

      const columns = [];

      Object.keys(indexMappings.properties).map((typeName) => {
        const typeMappings = indexMappings.properties[typeName];

        columns.push({
          name: typeName,
          type: typeMappings.type || typeMappings.properties,
          sampleData: [],
        });
      });

      indexFieldMap.push({
        tableName: indexName,
        columns,
      });
    });

    return indexFieldMap;
  }

  private async mapSampleDataToTableMD(
    indices: DbTableMetadataDto[],
  ): Promise<DbTableMetadataDto[]> {
    const promises = indices.map(async (index) => {
      const query = {
        index: index.tableName,
        query: {
          match_all: {},
        },
        size: 2,
      };

      const result = await this.queryDB(query as ElasticSearchQueryDto);

      index.columns.map((column) => {
        column.sampleData.push(
          ...result.map((row) => row._source[column.name]),
        );
      });
      return index;
    });

    return Promise.all(promises);
  }

  private verify() {
    if (
      !process.env.ES_CLOUD_ID ||
      !process.env.ES_USERNAME ||
      !process.env.ES_PASSWORD
    ) {
      throw new Error(
        `Elastic Search's environment variable are not set. Please refer .env.sample`,
      );
    }
  }

  private connect() {
    try {
      this.esClient = new Client({
        cloud: {
          id: process.env.ES_CLOUD_ID,
        },
        auth: {
          username: process.env.ES_USERNAME,
          password: process.env.ES_PASSWORD,
        },
      });
    } catch (error) {
      throw new Error(`Error connecting to Elastic Search: ${error}`);
    }
  }
}
