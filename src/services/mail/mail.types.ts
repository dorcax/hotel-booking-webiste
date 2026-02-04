import { IsDateString, IsEmail, IsNotEmpty, IsNumber, IsString } from "class-validator"

export class VerificationDto{
    @IsEmail()
    email:string
    
    @IsString()
    code:string

    @IsString()
    name:string
    
    @IsNumber()
    year:number
}


export class EmailReservationConfirmationDto{
    @IsString()
    @IsNotEmpty()
    roomNumber:string

    @IsString()    
    @IsNotEmpty()
    name:string 

    @IsDateString()

    checkOut:string

    @IsDateString()
    checkIn:string

    @IsString()
    @IsNotEmpty()
    totalAmount:string

    @IsString()
    @IsNotEmpty()
    nights:string

    

    @IsEmail()
    @IsNotEmpty()
    userEmail:string

    @IsString()
    @IsNotEmpty()
    bookingId:string 

    @IsString()
    @IsNotEmpty()
    hotelName:string
}