import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { createRoomDto, updateRoomDto } from './room.type';
import { connectId, createAttachments, updateAttachments } from 'prisma/prisma.util';
import { userEntity } from '../auth/auth.types';
import { bad } from 'src/utils/error';

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}

  async createRoom(dto: createRoomDto) {
    const { attachments, hotelId, ...rest } = dto;

    // check if hotel exists
    const room = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
    });


    if (!room) {
      throw new Error('Hotel not found');
    }
    // create the room

     await this.prisma.room.create({
      data: {
        ...rest,
        hotel: connectId(hotelId),
        attachment: createAttachments(attachments),
      },
    });

    return {message:"room created successfully"}
  }

//   update room 
async  updateRoom(dto:updateRoomDto,roomId:string){
    const {attachments,...rest} =dto
     // check if room exists
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new Error('Hotel not found');
    }

    await this.prisma.$transaction(async(tx)=>{
      await tx.room.update({
        where:{
            id:roomId
        },
        data:{
            ...rest,
            attachment:attachments.length ? updateAttachments(attachments):undefined
        }
    })

    if(attachments.length){
        await this.prisma.upload.deleteMany({
            where:{
                id:{notIn:attachments},
                attachments:{some:{id:room.attachmentId}}
            }
        })
    }
    })
   return {message:"room updated successfully"}
  

}

  async deleteRoom(roomId: string, user: userEntity) {
    const room = await this.prisma.hotel.findUnique({
      where: { id: roomId },
    });

    if (!room || room.userId !== user.id) {
      bad('room not found ');
    }

    await this.prisma.room.delete({
      where: { id: roomId },
    });

    return { message: 'room deleted successfully' };
  }
}
