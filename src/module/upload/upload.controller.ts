import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { userEntity } from '../auth/auth.types';
import { AuthUser } from '../auth/deocorator/auth.decorator';
import { bad } from 'src/utils/error';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post(':id')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @AuthUser() user: userEntity,
    @Query('order') orderParams?: string,
  ) {
    const order = Number(orderParams) || 0;
    return await this.uploadService.upload(id, file, order, user);
  }

  @Post('bulk')
  async uploadIds(@Body('ids') ids: string[]) {
    return await this.uploadService.uploadIds(ids);
  }

  @Get(':id')
  async downloadUpload(@Param('id') id: string) {
    return await this.uploadService.download(id);
  }

  @Delete()
  async cleanUp(
    @Body('ids') ids: string | string[],
    @AuthUser() user: userEntity,
  ) {
    if (typeof ids === 'string') {
      // (/,\s*/g)
      ids.split(/,\s*/g);
    }
    if (!Array.isArray(ids)) bad('not an array');

    return await this.uploadService.deleteUpload(ids, user);
  }
}
