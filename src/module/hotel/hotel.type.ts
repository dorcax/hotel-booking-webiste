import { IsArray, IsEmail, IsString } from "class-validator"

export class createHotelDto{
    @IsString()
    name:string

   @IsEmail()
    email:string
    
    @IsString()
    contactPhone:string

    @IsString()
    description:string


    @IsString()
    address:string 

    @IsArray()
    amenities:string[]
    
    @IsArray()
    features:string[]
    
    @IsArray()
    attachments:string[]
}