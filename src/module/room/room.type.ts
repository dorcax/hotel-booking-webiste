import { RoomCategory } from '@prisma/client';
import { IsArray, IsEnum, IsNumber, IsString, IsUUID } from 'class-validator';
import { PaginationqueryDto } from 'src/utils/paginationQuery.type';

export class listRoomQuery extends PaginationqueryDto{
  @IsUUID("4")
  hotelId:string
}

export class createRoomDto {
  @IsString()
  name: string;
  @IsString()
  description: string;
  @IsNumber()
  price: number;
  @IsString()
  number: string;
  @IsEnum(RoomCategory)
  category: RoomCategory;
  @IsString()
  hotelId: string;
  @IsArray()
  attachments:string[]
}
 export class updateRoomDto {
    @IsString()
  name: string;
  @IsString()
  description: string;
  @IsNumber()
  price: number;
  @IsString()
  number: string;
  @IsEnum(RoomCategory)
  category: RoomCategory;
  @IsArray()
  attachments:string[]
 }