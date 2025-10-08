import { IsDate, IsString, IsUUID } from "class-validator"
import { userEntity } from "../auth/auth.types"

export class CreateReservationDto{
     @IsUUID("4")
    user:userEntity
     @IsUUID("4")
    hotelId:string

    @IsDate()
    checkIn:Date
      @IsDate()
    checkOut:Date
 
    @IsUUID("4")
    roomId:string 
}