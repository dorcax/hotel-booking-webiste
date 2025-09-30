import { Body, Controller, Post } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { createHotelDto } from './hotel.type';
import { AuthUser } from '../auth/deocorator/auth.decorator';
import { userEntity } from '../auth/auth.types';

@Controller('hotel')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}
  @Post()
  async createHotel(@Body() dto:createHotelDto,@AuthUser() user:userEntity){
    return this.hotelService.createHotel(dto, user)
  }
}
