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
    
     @IsString()
    rule:string
    
    @IsArray()
    attachments:string[]
}


// set = replace everything (wipes old and keeps only what you pass).

// connect = only adds new relations, leaves old ones untouched.

// disconnect = removes specific ones.
export class updateHotelDto extends createHotelDto{}