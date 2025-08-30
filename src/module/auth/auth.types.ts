
import{IsEmail, IsString} from "class-validator"


export const Auth_Otp_Token_Subject ={
    Verify_Email:"verify email",
    RESET_PASSWORD:"RESET Password"
}
export class registerDto {
    @IsString()
    name:string
    
    @IsEmail()
    email:string

    @IsString()
    phoneNumber:string

    @IsString()
    gender:string

    @IsString()
    password:string
    // email:
}



export class loginDto{
    @IsEmail()
    email:string
    @IsString()
    password:string
}

