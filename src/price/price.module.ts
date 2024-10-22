import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceService } from './price.service';
import { PriceController } from './price.controller';
import { Price } from './price.entity';
import { Alert } from './alert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Price, Alert])],  // Registering Price and Alert entities with TypeORM
  controllers: [PriceController],
  providers: [PriceService],
})
export class PriceModule {}
