import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ResDto } from './dto/common.dto';
import { RunQueryReqDto, RunQueryResDto } from './dto/query.dto';
import {
  AllTablesResDto,
  DbMetadataReqDto,
  DbMetadataResDto,
} from './dto/tables.dto';

@Controller('client')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health-check')
  getServerHealth() // : ResDto
  {
    return { status: 'success', msg: 'Health OK' };
  }

  @Get('tables')
  async getAllTableNames() // : Promise<AllTablesResDto>
  {
    return this.appService.getAllTableNames();
  }

  @Post('db_metadata')
  async getDbMetadata(
    @Body() reqDto: DbMetadataReqDto,
  ) // : Promise<DbMetadataResDto>
  {
    return this.appService.getDbMetadata(reqDto);
  }

  @Post('run_query')
  async runQuery(@Body() reqDto: RunQueryReqDto) // : Promise<RunQueryResDto>
  {
    return this.appService.runQuery(reqDto);
  }
}
