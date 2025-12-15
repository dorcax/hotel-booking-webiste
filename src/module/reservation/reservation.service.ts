import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { userEntity } from '../auth/auth.types';
import { bad } from 'src/utils/error';
import { CreateReservationDto } from './reservation.type';
import { connectId } from 'prisma/prisma.util';
import { add } from 'date-fns/fp';
import { addMinutes } from 'date-fns';

@Injectable()
export class ReservationService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(dto: CreateReservationDto) {
    const { user, checkIn, checkOut, roomId, hotelId } = dto;
    // verify if user exist 
    const existingUser = await this.prisma.user.findUnique({
      where: {
        id: user.sub,
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
            OR:[
              {status:"CONFIRMED"},
              {status:"PENDING",
                expiresAt:{gt:new Date()}
              }
            ]
      
          
        }
    })
    if(roomIsAvailable) bad("Room already booked for these dates")

        // create new reservation and send payment link 
        const reservation =await this.prisma.reservation.create({
            data:{
                checkIn,checkOut,
                expiresAt:addMinutes(new Date(),15),
                user:connectId(existingUser.id),
                hotel:connectId(hotelId),
                room:connectId(roomId)
            }
        })
     return {
        message:" room reservation created successfully.please compleayment",
        // payment link send
     }
  }
}
