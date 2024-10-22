import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { PriceModule } from './price/price.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: +process.env.DB_PORT || 5432,
      username: process.env.DB_USERNAME || 'dummy_user',
      password: process.env.DB_PASSWORD || 'dummy_password',
      database: process.env.DB_NAME || 'bc-tracker',
      autoLoadEntities: true, 
      synchronize: true, 
    }),
    ScheduleModule.forRoot(), // Enable cron jobs
    MailerModule.forRoot({
      transport: {
        service: process.env.EMAIL_HOST,// Email config
        port: process.env.EMAIL_PORT,
        secure: false,            
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    }),
    PriceModule, // Import the PriceModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
