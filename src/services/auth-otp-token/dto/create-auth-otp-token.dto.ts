import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from "class-validator"
import {AuthOtpTokenType} from "@prisma/client"
import { Auth_Otp_Token_Subject } from "src/module/auth/auth.types"
import { $Enums } from "@prisma/client";

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



export class VerifyOtp{
    @IsString()
    code:string
     @IsString()
   subject:string
}