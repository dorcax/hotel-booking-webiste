import { Injectable } from '@nestjs/common';
import { connectId } from 'prisma/prisma.util';
import cloudinary, { handleUpload } from 'src/config/cloudinary.config';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { userEntity } from '../auth/auth.types';

@Injectable()
export class UploadService {
    constructor(private readonly prisma :PrismaService){}

async uploadFile(file:Express.Multer.File,order:number,user:userEntity){
    const uploadResult:any = await handleUpload(file.buffer)
    const data= await this.prisma.upload.create({
        data:{
           name:file.originalname,
           url:uploadResult.secure_url,
           publicId:uploadResult.public_id,
           type:file.mimetype,
           size:file.size,
           order,
           user:connectId(user.sub)
        }
    })
    console.log("upload be",data)
    return data

}

// get upload by id  

async uploadIds(ids:string[]){
    return await this.prisma.upload.findMany({
        where:{
            id:{in:ids}
        },
        include:{
            attachments:true,
            hotels:true
        }
    })}


// download the url 
async download(id:string){
return await this.prisma.upload.findUnique({
    where:{
        id
    },
    select:{
        url:true,name:true,type:true
    }
})
}
// delete upload from cloudinary

async deleteUpload(ids:string[],user:userEntity){
    const uploads =await this.prisma.upload.findMany({
        where:{
            id:{in:ids},
            user:{
                id:user.sub
            }
        }
    }) 
    // delete from cloudinary 
    for(let upload of uploads){
        if(upload.publicId){
            await cloudinary.uploader.destroy(upload.publicId)
        }
    }


    // delete in db 
  return await this.prisma.upload.deleteMany({
        where:{
            id:{in:ids},
            user:{
                id:user.sub
            }
        }
    })

}
}
