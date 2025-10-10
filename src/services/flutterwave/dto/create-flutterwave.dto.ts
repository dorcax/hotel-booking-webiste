import { IsString } from 'class-validator';
export const FLUTTERWAVE_INITIATE_PAYMENT="https://api.flutterwave.com/v3/payments"
export class CreateFlutterwaveDto {
 
  @IsString()
  amount: string;
  @IsString()
  currency: string;
  @IsString()
  roomId: string;

    @IsString()
  reservationId: string;
}
