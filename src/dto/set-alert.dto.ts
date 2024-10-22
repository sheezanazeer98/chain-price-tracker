import { ApiProperty } from '@nestjs/swagger';

export class SetAlertDto {
  @ApiProperty({ description: 'Blockchain chain name (e.g., ethereum, polygon)' })
  chain: string;

  @ApiProperty({ description: 'Alert price in USD' })
  alertPrice: number;

  @ApiProperty({ description: 'Email to send the alert to' })
  email: string;
}
