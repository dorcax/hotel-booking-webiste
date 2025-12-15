import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { userEntity } from '../auth/auth.types';
import { Auth, AuthUser } from '../auth/deocorator/auth.decorator';
import { RoomService } from './room.service';
import { createRoomDto, listRoomQuery, updateRoomDto } from './room.type';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}
  @Auth()
  @Post()
  async createHotel(@Body() dto: createRoomDto,@AuthUser() user:userEntity) {
    return await this.roomService.createRoom(dto,user);
  }

  @Get()
  async list(@Query() query: listRoomQuery) {
    return await this.roomService.list(query);
  }

  @Auth()
  @Get(':hotelId')
  async getHotels(
    @Param('hotelId') hotelId: string,
    @AuthUser() user: userEntity,
  ) {
    return await this.roomService.getRooms(hotelId, user);
  }

  @Get(':hotelId/:roomId')
  async getHotel(
    @Param('hotelId') hotelId: string,
    @Param('roomId') roomId: string,
    @AuthUser() user: userEntity,
    
  ) {
    return await this.roomService.getRoom(hotelId, roomId, user);
  }
 @Auth()
  @Patch(":roomId")
  async updateHotel(@Body() dto:updateRoomDto,@AuthUser() user:userEntity,@Param("roomId") roomId:string) {
    return await this.roomService.updateRoom(dto,user,roomId);
  }
   
  @Auth()
  @Delete(":roomId")
  async deleteHotel (@Param("roomId") roomId:string){
    return await this.roomService.deleteRoom(roomId)

  }
}
