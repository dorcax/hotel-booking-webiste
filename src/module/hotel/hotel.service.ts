import { Injectable } from '@nestjs/common';
import { createHotelDto } from './hotel.type';
import { userEntity } from '../auth/auth.types';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { bad } from 'src/utils/error';

@Injectable()
export class HotelService {
    constructor(private readonly prisma :PrismaService){}
    async createHotel(dto:createHotelDto,user:userEntity){
        const{attachments,...rest} =dto

   // find if user exist
   const currentUser =await this.prisma.user.findUnique({
    where:{
        id:user.id
    }
   }) 

   if(!user) bad("user does not exist")
    const hotel =await this.prisma.hotel.create({
        data:{
            ...rest,
            
            
        }
    })

    }
}
