import { Controller, Query } from '@nestjs/common';
import { RoomService } from './room.service';
import { listRoomQuery } from './room.type';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  async list(@Query() query:listRoomQuery){
    return await this.roomService.list(query)

  }
}
