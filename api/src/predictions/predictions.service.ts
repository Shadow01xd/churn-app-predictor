import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { PredictChurnDto, PredictionResult } from './dto/predict-churn.dto';

@Injectable()
export class PredictionsService {
  private readonly logger = new Logger(PredictionsService.name);
  private readonly mlServiceUrl: string;

  constructor(
    private readonly http: HttpService,
    config: ConfigService,
  ) {
    this.mlServiceUrl = (
      config.get<string>('ML_SERVICE_URL') ?? 'http://localhost:8001'
    ).replace(/\/$/, '');
  }

  /**
   * Delega la inferencia al microservicio FastAPI y devuelve
   * { churn_probability, risk_label }.
   */
  async predict(features: PredictChurnDto): Promise<PredictionResult> {
    const url = `${this.mlServiceUrl}/predict`;

    try {
      const { data } = await firstValueFrom(
        this.http.post<PredictionResult>(url, features, {
          timeout: 5000,
        }),
      );
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        // El microservicio respondió con un error (p.ej. 422 de validación)
        this.logger.error(
          `ML service respondió ${axiosError.response.status}: ${JSON.stringify(
            axiosError.response.data,
          )}`,
        );
        throw new BadGatewayException(
          'El microservicio de ML rechazó la petición de predicción.',
        );
      }

      // No hubo respuesta: servicio caído / URL mal / timeout
      this.logger.error(
        `No se pudo contactar al ML service en ${url}: ${axiosError.message}`,
      );
      throw new ServiceUnavailableException(
        'El microservicio de ML no está disponible.',
      );
    }
  }
}
