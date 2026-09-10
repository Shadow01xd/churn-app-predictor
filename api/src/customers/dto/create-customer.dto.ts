import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { PredictChurnDto } from '../../predictions/dto/predict-churn.dto';

/**
 * Datos para crear un cliente: identificación + las mismas 19 features
 * que consume el modelo ML (heredadas de PredictChurnDto).
 */
export class CreateCustomerDto extends PredictChurnDto {
  @ApiProperty({ example: 'Ana Pérez' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'ana.perez@example.com' })
  @IsEmail()
  email: string;
}
