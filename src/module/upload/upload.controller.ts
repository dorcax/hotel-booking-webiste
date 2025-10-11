import { Controller, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { userEntity } from '../auth/auth.types';
import { AuthUser } from '../auth/deocorator/auth.decorator';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post(":id")
  @UseInterceptors(FileInterceptor("file"))
  async upload(@Param("id") id:string ,@UploadedFile() file:Express.Multer.File,@Query("order") orderParams?:string,@AuthUser() user:userEntity){
    const order =Number(orderParams) ||0
    return await this.uploadService.upload(id,file,order,user)
  }
}
