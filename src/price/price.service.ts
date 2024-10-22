import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Price } from './price.entity';
import { Alert } from './alert.entity';
import axios from 'axios';
import { Cron } from '@nestjs/schedule';
import { MailerService } from '@nestjs-modules/mailer';
import { SetAlertDto } from '../dto/set-alert.dto';
import { LessThan } from 'typeorm';

@Injectable()
export class PriceService {
  constructor(
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    private mailerService: MailerService
  ) {
    
  }

  @Cron('*/1 * * * *')
  async fetchPrices() {
    console.log("Start Working");
    const chains = ['ethereum', 'polygon'];
    const promises = chains.map(async (chain) => {
      const price = await this.getPrice(chain);
      await this.savePrice(chain, price);
      await this.checkAlerts(chain, price);
  
    });
    await Promise.all(promises);
  }

  private async getPrice(chain: string): Promise<number> {
  console.log("start getting price");
    const url = chain == "ethereum" ? process.env.ETH_URL :  process.env.POL_URL;
    const response = await axios.get(url, {
      headers: { 'X-API-Key': process.env.MORALIS_API_KEY },
    });

    console.log("get price done");
    return response.data.usdPrice;
  }

  private async savePrice(chain: string, price: number) {
    console.log("start saving price");
    const newPrice = this.priceRepository.create({ chain, price });
    await this.priceRepository.save(newPrice);
    console.log(" saved done");
  }

  private async checkAlerts(chain: string, price: number) {
    console.log("alert checker");
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentPrice = await this.priceRepository.findOne({
      where: { chain, createdAt: MoreThan(oneHourAgo) },
      order: { createdAt: 'DESC' },
    });
   
    if (recentPrice && price >= recentPrice.price * 1.03) {
      console.log("3% up");
      await this.sendEmail('Price increase alert', process.env.ALERT_EMAIL,price);
    }

    const alerts = await this.alertRepository.find({
      where: {
        chain,
        alertPrice: LessThan(price),  // Find all alerts where alertPrice < current price
      },
    });
    
    for (const alert of alerts) {
      console.log("start sending mail");
      await this.sendEmail(`Price alert for ${chain}`, alert.email, price);
    }
    
  }

  private async sendEmail(subject: string, email: string , price :number) {
    console.log("start mail working");
    console.log(process.env.EMAIL_USER);
    await this.mailerService.sendMail({
      to: email,
      from: process.env.EMAIL_USER,
      subject: subject,
      text: `The price has met the condition.Now Price is ${price} `,
    });
    console.log("mail sent successfully");
  }

  async getHourlyPrices(chain: string) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Retrieve all prices from the last 24 hours, ordered by `createdAt`
    const prices = await this.priceRepository.find({
      where: { chain, createdAt: MoreThan(oneDayAgo) },
      order: { createdAt: 'DESC' },
    });
  
    const hourlyPrices = [];
  
    for (let i = 0; i < 24; i++) {
      const hourStart = new Date(Date.now() - (i + 1) * 60 * 60 * 1000); // i hours ago
      const hourEnd = new Date(Date.now() - i * 60 * 60 * 1000);          // (i - 1) hours ago
      
      const priceForHour = prices.find(
        price => price.createdAt >= hourStart && price.createdAt <= hourEnd
      );
  
      if (priceForHour) {
        hourlyPrices.push(priceForHour);
      }
    }
  
    return hourlyPrices;
  }
  

  async setAlert(setAlertDto: SetAlertDto) {
    const alert = this.alertRepository.create(setAlertDto);
    return this.alertRepository.save(alert);
  }

  // Fetch ETH to USD and BTC to USD prices and calculate swap rate and fees
  async getSwapRate(ethAmount: number) {
    const ethUrl = process.env.ETH_URL;
    const btcUrl = process.env.BTC_URL;

    try {
      // Fetch ETH to USD price
      const ethResponse = await axios.get(ethUrl, {
        headers: { 'X-API-Key': process.env.MORALIS_API_KEY },
      });
      const ethToUsdRate = ethResponse.data.usdPrice;

      // Fetch BTC to USD price
      const btcResponse = await axios.get(btcUrl, {
        headers: { 'X-API-Key': process.env.MORALIS_API_KEY },
      });
      const btcToUsdRate = btcResponse.data.usdPrice;

      // Calculate how much USD the ETH amount is worth
      const ethUsdValue = ethAmount * ethToUsdRate;

      // Calculate how much BTC the USD value of ETH can get
      const btcAmount = ethUsdValue / btcToUsdRate;

      // Calculate the 0.03 (3%) fee in ETH
      const feePercentage = 0.03;
      const ethFee = ethAmount * feePercentage;

      // Calculate the fee in USD
      const feeInUsd = ethFee * ethToUsdRate;

      return {
        btcAmount: btcAmount * (1 - feePercentage), // BTC received after the fee
        feeInEth: ethFee,
        feeInUsd: feeInUsd,
      };
    } catch (error) {
      console.error('Error fetching swap rate:', error);
      throw new Error('Error fetching swap rate.');
    }
  }

}
