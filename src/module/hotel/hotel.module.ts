import { Global, Module } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { HotelController } from './hotel.controller';
import { PrismaService } from 'src/services/prisma/prisma.service';
@Global()
@Module({
  controllers: [HotelController],
  providers: [HotelService,PrismaService],
})
export class HotelModule {}
