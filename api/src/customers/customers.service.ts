import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { PredictionsService } from '../predictions/predictions.service';
import {
  ML_FEATURE_KEYS,
  PredictChurnDto,
} from '../predictions/dto/predict-churn.dto';
import { Customer } from './customer.entity';
import { checkFeatureCoherence } from './feature-coherence';
import { CreateCustomerDto } from './dto/create-customer.dto';
import {
  PaginatedResult,
  QueryCustomersDto,
} from './dto/query-customers.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    private readonly predictionsService: PredictionsService,
  ) {}

  async create(dto: CreateCustomerDto): Promise<Customer> {
    this.assertCoherent(dto);
    const customer = this.customerRepo.create(dto);
    await this.runPrediction(customer);

    try {
      return await this.customerRepo.save(customer);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async findAll(
    query: QueryCustomersDto,
  ): Promise<PaginatedResult<Customer>> {
    const { page, limit, risk, search } = query;

    const qb = this.customerRepo.createQueryBuilder('customer');

    if (risk) {
      qb.andWhere('customer.risk_label = :risk', { risk });
    }
    if (search?.trim()) {
      qb.andWhere(
        '(customer.name ILIKE :s OR customer.email ILIKE :s)',
        { s: `%${search.trim()}%` },
      );
    }

    qb.orderBy('customer.churn_probability', 'DESC', 'NULLS LAST')
      .addOrderBy('customer.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepo.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException(`Cliente ${id} no encontrado`);
    }
    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    Object.assign(customer, dto);
    // Se valida la entidad ya fusionada: los campos que no vienen en el PATCH
    // conservan su valor previo y también deben quedar coherentes.
    this.assertCoherent(customer);
    await this.runPrediction(customer);

    try {
      return await this.customerRepo.save(customer);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /** Fuerza el recálculo de la predicción (p.ej. si la ML estaba caída al crear). */
  async repredict(id: string): Promise<Customer> {
    const customer = await this.findOne(id);
    await this.runPrediction(customer, { rethrow: true });
    return this.customerRepo.save(customer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepo.remove(customer);
  }

  /**
   * Extrae las 19 features del cliente, pide la predicción al microservicio ML
   * y la escribe en la entidad (sin guardar todavía).
   *
   * Si la ML no está disponible y `rethrow` es false (default), NO falla:
   * deja la predicción en null para poder recalcularla luego con /repredict.
   */
  private async runPrediction(
    customer: Customer,
    opts: { rethrow?: boolean } = {},
  ): Promise<void> {
    const features = Object.fromEntries(
      ML_FEATURE_KEYS.map((key) => [key, customer[key]]),
    ) as unknown as PredictChurnDto;

    try {
      const { churn_probability, risk_label } =
        await this.predictionsService.predict(features);
      customer.churn_probability = churn_probability;
      customer.risk_label = risk_label;
      customer.predicted_at = new Date();
    } catch (error) {
      if (opts.rethrow) throw error;
      this.logger.warn(
        `No se pudo calcular la predicción para "${customer.email}"; ` +
          `se guarda sin predicción. Detalle: ${(error as Error).message}`,
      );
      customer.churn_probability = null;
      customer.risk_label = null;
      customer.predicted_at = null;
    }
  }

  /** Lanza 400 si las features tienen combinaciones imposibles para el modelo. */
  private assertCoherent(features: object): void {
    const errors = checkFeatureCoherence(
      features as Record<string, unknown>,
    );
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
  }

  private normalizeError(error: unknown): unknown {
    if (
      error instanceof QueryFailedError &&
      (error as unknown as { code?: string }).code === '23505'
    ) {
      return new ConflictException('Ya existe un cliente con ese email');
    }
    return error;
  }
}
