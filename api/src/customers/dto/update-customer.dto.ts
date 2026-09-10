import { PartialType } from '@nestjs/swagger';
import { CreateCustomerDto } from './create-customer.dto';

/**
 * Todos los campos de CreateCustomerDto pero opcionales.
 * PartialType de @nestjs/swagger también relaja los validadores.
 */
export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
