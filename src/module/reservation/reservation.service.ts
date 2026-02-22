import { Injectable } from '@nestjs/common';
import { addMinutes } from 'date-fns';
import { connectId } from 'prisma/prisma.util';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { bad } from 'src/utils/error';
import { CreateReservationDto } from './reservation.type';
import { FlutterwaveService } from 'src/services/flutterwave/flutterwave.service';
@Injectable()
export class ReservationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly flutterWave: FlutterwaveService,
  ) {}

  async createBooking(dto: CreateReservationDto) {
    const { user, checkIn, checkOut, roomId, propertyId } = dto;

    // validate date
    if (new Date(checkIn) >= new Date(checkOut))
      return bad('checkout date must be greater than checkin date');

    if (new Date(checkIn) < new Date())
      return bad('Check-in date cannot be in the past');


    if (!!roomId === !!propertyId)
    return bad('You must book either an apartment or a room, not both');
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
        propertyId,
      },
    });
    if (!room) bad('room not found');
    // Check if room is already booked in the date range
    const reservation = await this.prisma.$transaction(async (tx) => {
      const roomIsAvailable = await tx.booking.findFirst({
        where: {
          roomId,
          AND: [{ checkIn: { lt: checkOut } }, { checkOut: { gt: checkIn } }],
          OR: [
            { status: 'CONFIRMED' },
            { status: 'PENDING', expiresAt: { gt: new Date() } },
          ],
        },
      });
      if (roomIsAvailable) bad('Room already booked for these dates');

      // calculate the amount of night the user want to stay
      const millisecondsInOneDay = 1000 * 60 * 60 * 24;
      const nights = Math.ceil(
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
          millisecondsInOneDay,
      );
      const totalCalculation = (nights / millisecondsInOneDay) * room.price;

      const newReservation = await tx.booking.create({
        data: {
          checkIn,
          checkOut,
          totalPrice: parseInt(totalCalculation.toString()),
          expiresAt: addMinutes(new Date(), 15),
          guest: connectId(existingUser.id),
          property: connectId(propertyId),
          room: connectId(roomId),
        },
      });
      return newReservation;
    });
    const totalAmount = reservation?.totalPrice;

    const reservationLink = await this.flutterWave.initiatePayment(
      {
        amount: totalAmount,
        currency: 'NGN',
        roomId,
        reservationId: reservation.id,
      },
      user,
    );
    return {
      message:
        'Room reservation created successfully. Please complete payment.',
      reservation,

      paymentLink: reservationLink?.payment_link,
    };
  }
}


