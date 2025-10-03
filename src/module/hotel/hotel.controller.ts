import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { createHotelDto, updateHotelDto } from './hotel.type';
import { AuthUser } from '../auth/deocorator/auth.decorator';
import { userEntity } from '../auth/auth.types';

@Controller('hotel')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}
  @Post()
  async createHotel(@Body() dto:createHotelDto,@AuthUser() user:userEntity){
    return await this.hotelService.createHotel(dto, user)
  }

  @Get(":hotelId")
  async getHotel(@Param("hotelId") hotelId:string, @AuthUser() user:userEntity){
    return await this.hotelService.getHotel(user,hotelId)
  }


  @Get()
  async getHotels(@AuthUser() user:userEntity){
    return await this.hotelService.getHotels(user)
  }


  @Patch()
  async updateHotel(@Body() dto:updateHotelDto,@AuthUser() user:userEntity){
    return await this.hotelService.updateHotel(dto,user)

  } 
  @Delete(":hotelId")
  async deleteHotel(@Param("hotelId") hotelId:string, @AuthUser() user:userEntity){
    return await this.hotelService.deleteHotel(hotelId,user)
    
  }

}
