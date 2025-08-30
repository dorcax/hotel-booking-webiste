import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from "class-validator"
import {AuthOtpTokenType} from "@prisma/client"


export class CreateAuthOtpTokenDto {
    @IsString()
    subject: string
    @IsEnum(AuthOtpTokenType )
    type:AuthOtpTokenType 
    @IsDate()
    expiry: Date
    @IsString()
    email: string
    
    @IsUUID("4")
    @IsOptional()
    hotelId?: string
    @IsUUID("4")
    @IsString()
    userId: string
}
