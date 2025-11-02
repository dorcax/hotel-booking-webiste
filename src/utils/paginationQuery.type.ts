import { Type } from "class-transformer"
import { IsNumber, IsOptional, IsString } from "class-validator"

export class PaginationqueryDto {
@IsNumber()
@IsOptional()
@Type(()=>Number)
count:number

@IsString()
@IsOptional()
search?:string 



@IsNumber()
@IsOptional()
@Type(()=>Number)
page:number 
}

