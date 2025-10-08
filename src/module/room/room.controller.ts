import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RoomService } from './room.service';
import { createRoomDto, listRoomQuery } from './room.type';
import { AuthUser } from '../auth/deocorator/auth.decorator';
import { userEntity } from '../auth/auth.types';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}
   

  @Post()
  async createHotel(@Body() dto:createRoomDto){
    return await this.roomService.createRoom(dto)
    
  }

  @Get(":hotelId")
  async list(@Query() query:listRoomQuery){
    return await this.roomService.list(query)

  }

  @Get(":hotelId")
  async getHotels(@Param("hotelId") hotelId:string,@AuthUser() user:userEntity){
    return await this.roomService.getRooms(hotelId,user)
  }

  @Get(":hotelId/:roomId")
  async getHotel(@Param("hotelId") hotelId:string,@Param("roomId") roomId:string,@AuthUser() user:userEntity ){
    return await this.roomService.getRoom(hotelId,roomId,user)
  }
}
