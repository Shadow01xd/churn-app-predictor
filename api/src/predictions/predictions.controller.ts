import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PredictChurnDto, PredictionResultDto } from './dto/predict-churn.dto';
import { PredictionsService } from './predictions.service';

@ApiTags('predictions')
@ApiBearerAuth()
@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  /**
   * POST /predictions — predicción "suelta" (sin persistir un cliente).
   * Útil para simulaciones. Protegido por el JwtAuthGuard global.
   */
  @Post()
  @ApiOperation({
    summary: 'Predecir churn a partir de features (delega en el microservicio ML)',
  })
  @ApiResponse({ status: 201, type: PredictionResultDto })
  @ApiResponse({ status: 400, description: 'Features inválidas' })
  @ApiResponse({ status: 502, description: 'El microservicio de ML rechazó la petición' })
  @ApiResponse({ status: 503, description: 'El microservicio de ML no está disponible' })
  predict(@Body() dto: PredictChurnDto) {
    return this.predictionsService.predict(dto);
  }
}
