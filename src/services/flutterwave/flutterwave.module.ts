import { Module } from '@nestjs/common';
import { FlutterwaveService } from './flutterwave.service';
import { FlutterwaveController } from './flutterwave.controller';
import {HttpModule} from "@nestjs/axios"
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports:[HttpModule],
  controllers: [FlutterwaveController],
  providers: [FlutterwaveService,PrismaService],
})
export class FlutterwaveModule {}
