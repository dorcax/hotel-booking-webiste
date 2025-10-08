import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { userEntity } from '../auth/auth.types';
import { bad } from 'src/utils/error';
import { CreateReservationDto } from './reservation.type';
import { connectId } from 'prisma/prisma.util';

@Injectable()
export class ReservationService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(dto: CreateReservationDto) {
    const { user, checkIn, checkOut, roomId, hotelId } = dto;
    // verify if user exist 
    const existingUser = await this.prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!existingUser) bad('user not found ');

 
    //Verify that the hotel exists and contains the roomId
    const room = await this.prisma.room.findFirst({
      where: {
        id: roomId,
        hotelId,
      },
    });
    if (!room) bad('room not found');
    // Check if room is already booked in the date range

    const roomIsAvailable =await this.prisma.reservation.findFirst({
        where:{
            roomId,
            AND:[{checkIn:{lte:checkOut}},{checkOut:{gte:checkIn}}],
            status:{in:["CONFIRMED","COMPLETED"]}
        }
    })
    if(roomIsAvailable) bad("Room already booked for these dates")

        // create new reservation and send payment link 
        const reservation =await this.prisma.reservation.create({
            data:{
                checkIn,checkOut,
                user:connectId(existingUser.id),
                hotel:connectId(hotelId),
                room:connectId(roomId)
            }
        })
     return {
        message:" room reservation created successfully.please complete payment",
        // payment link send
     }
  }
}
