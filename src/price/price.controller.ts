import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { PriceService } from './price.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SetAlertDto } from '../dto/set-alert.dto';

@ApiTags('Price')
@Controller('price')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @ApiOperation({ summary: 'Get hourly prices of a blockchain chain' })
  @ApiResponse({ status: 200, description: 'Returns hourly prices within 24 hours' })
  @Get('/prices')
  async getPrices(@Query('chain') chain: string) {
    return await this.priceService.getHourlyPrices(chain);
  }

  @ApiOperation({ summary: 'Set price alert for a chain' })
  @ApiResponse({ status: 201, description: 'Price alert set successfully' })
  @Post('/alert')
  async setAlert(@Body() setAlertDto: SetAlertDto) {
    return await this.priceService.setAlert(setAlertDto);
  }

  @ApiOperation({ summary: 'Get swap rate from ETH to BTC' })
  @ApiResponse({ status: 200, description: 'Returns the BTC amount and fees for the given ETH amount' })
  @Get('/swap-rate')
  async getSwapRate(@Query('ethAmount') ethAmount: number) {
    return await this.priceService.getSwapRate(ethAmount);
  }
}
