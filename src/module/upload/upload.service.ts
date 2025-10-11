import { Injectable } from '@nestjs/common';
import { connectId } from 'prisma/prisma.util';
import cloudinary, { handleUpload } from 'src/config/cloudinary.config';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { userEntity } from '../auth/auth.types';

@Injectable()
export class UploadService {
    constructor(private readonly prisma :PrismaService){}

async upload(id:string ,file:Express.Multer.File,order:number,user:userEntity){
    const uploadResult:any = await handleUpload(file.buffer)
    return await this.prisma.upload.create({
        data:{
           name:file.originalname,
           url:uploadResult.secure_url,
           publicId:uploadResult.public_url,
           type:file.mimetype,
           size:file.size,
           order,
           user:connectId(user.id)
        }
    })

}


// delete upload from cloudinary
}
