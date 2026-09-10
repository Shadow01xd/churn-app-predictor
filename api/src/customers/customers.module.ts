import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PredictionsModule } from '../predictions/predictions.module';
import { Customer } from './customer.entity';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Customer]), PredictionsModule],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
