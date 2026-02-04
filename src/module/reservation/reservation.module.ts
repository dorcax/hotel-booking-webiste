import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { FlutterwaveModule } from 'src/services/flutterwave/flutterwave.module';

@Module({
  imports:[FlutterwaveModule],
  controllers: [ReservationController],
  providers: [ReservationService,PrismaService],
})
export class ReservationModule {}
