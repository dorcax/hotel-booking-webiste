import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { userEntity } from '../auth/auth.types';
import { Auth, AuthUser } from '../auth/deocorator/auth.decorator';
import { RoomService } from './room.service';
import { createRoomDto, listRoomQuery, updateRoomDto } from './room.type';

@ApiTags('Rooms')
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Auth()
  @Post()
  @ApiOperation({ summary: 'Create a room for a hotel property'})
  @ApiBody({ type: createRoomDto })
  @ApiResponse({ status: 201, description: 'Room created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request or Validation failed.' })
  async createHotel(@Body() dto: createRoomDto, @AuthUser() user: userEntity) {
    return await this.roomService.createRoom(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List all rooms with optional filters' })
  @ApiQuery({ type: listRoomQuery, required: false })
  @ApiResponse({
    status: 200,
    description: 'List of rooms retrieved successfully.',
  })
  async list(@Query() query: listRoomQuery) {
    return await this.roomService.list(query);
  }

  @Auth()
  @Get(':hotelId')
  @ApiOperation({ summary: 'Get all rooms of a specific hotel' })
  @ApiParam({ name: 'hotelId', description: 'ID of the hotel' })
  @ApiResponse({ status: 200, description: 'Rooms retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Hotel not found.' })
  async getHotels(
    @Param('hotelId') hotelId: string,
    @AuthUser() user: userEntity,
  ) {
    return await this.roomService.getRooms(hotelId, user);
  }

  @Get(':hotelId/:roomId')
  @ApiOperation({ summary: 'Get a single room of a specific hotel' })
  @ApiParam({ name: 'hotelId', description: 'ID of the hotel' })
  @ApiParam({ name: 'roomId', description: 'ID of the room' })
  @ApiResponse({ status: 200, description: 'Room retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Room or Hotel not found.' })
  async getHotel(
    @Param('hotelId') hotelId: string,
    @Param('roomId') roomId: string,
    @AuthUser() user: userEntity,
  ) {
    return await this.roomService.getRoom(hotelId, roomId, user);
  }

  @Auth()
  @Patch(':roomId')
  @ApiOperation({ summary: 'Update a room of a hotel' })
  @ApiParam({ name: 'roomId', description: 'ID of the room to update' })
  @ApiBody({ type: updateRoomDto })
  @ApiResponse({ status: 200, description: 'Room updated successfully.' })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  async updateHotel(
    @Body() dto: updateRoomDto,
    @AuthUser() user: userEntity,
    @Param('roomId') roomId: string,
  ) {
    return await this.roomService.updateRoom(dto, user, roomId);
  }

  @Auth()
  @Delete(':roomId')
  @ApiOperation({ summary: 'Delete a room of a hotel' })
  @ApiParam({ name: 'roomId', description: 'ID of the room to delete' })
  @ApiResponse({ status: 200, description: 'Room deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Room not found.' })
  async deleteHotel(@Param('roomId') roomId: string) {
    return await this.roomService.deleteRoom(roomId);
  }
}
