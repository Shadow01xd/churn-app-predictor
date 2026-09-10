import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNumber, Max, Min } from 'class-validator';

/**
 * Features de un cliente para predecir churn.
 * Refleja el schema `CustomerFeatures` del microservicio FastAPI
 * (ml-service/app/schemas.py).
 */
export class PredictChurnDto {
  // ── Numéricas ──────────────────────────────────────────────────────────────
  @ApiProperty({ example: 0, minimum: 0, maximum: 1, description: 'Es adulto mayor (0=No, 1=Sí)' })
  @IsInt()
  @Min(0)
  @Max(1)
  SeniorCitizen: number;

  @ApiProperty({ example: 2, minimum: 0, description: 'Meses como cliente' })
  @IsInt()
  @Min(0)
  tenure: number;

  @ApiProperty({ example: 95.0, minimum: 0, description: 'Cargo mensual en USD' })
  @IsNumber()
  @Min(0)
  MonthlyCharges: number;

  @ApiProperty({ example: 190.0, minimum: 0, description: 'Total acumulado pagado en USD' })
  @IsNumber()
  @Min(0)
  TotalCharges: number;

  // ── Categóricas ────────────────────────────────────────────────────────────
  @ApiProperty({ example: 'Male', enum: ['Male', 'Female'] })
  @IsIn(['Male', 'Female'])
  gender: string;

  @ApiProperty({ example: 'No', enum: ['Yes', 'No'] })
  @IsIn(['Yes', 'No'])
  Partner: string;

  @ApiProperty({ example: 'No', enum: ['Yes', 'No'] })
  @IsIn(['Yes', 'No'])
  Dependents: string;

  @ApiProperty({ example: 'Yes', enum: ['Yes', 'No'] })
  @IsIn(['Yes', 'No'])
  PhoneService: string;

  @ApiProperty({ example: 'Yes', enum: ['Yes', 'No', 'No phone service'] })
  @IsIn(['Yes', 'No', 'No phone service'])
  MultipleLines: string;

  @ApiProperty({ example: 'Fiber optic', enum: ['DSL', 'Fiber optic', 'No'] })
  @IsIn(['DSL', 'Fiber optic', 'No'])
  InternetService: string;

  @ApiProperty({ example: 'No', enum: ['Yes', 'No', 'No internet service'] })
  @IsIn(['Yes', 'No', 'No internet service'])
  OnlineSecurity: string;

  @ApiProperty({ example: 'No', enum: ['Yes', 'No', 'No internet service'] })
  @IsIn(['Yes', 'No', 'No internet service'])
  OnlineBackup: string;

  @ApiProperty({ example: 'No', enum: ['Yes', 'No', 'No internet service'] })
  @IsIn(['Yes', 'No', 'No internet service'])
  DeviceProtection: string;

  @ApiProperty({ example: 'No', enum: ['Yes', 'No', 'No internet service'] })
  @IsIn(['Yes', 'No', 'No internet service'])
  TechSupport: string;

  @ApiProperty({ example: 'Yes', enum: ['Yes', 'No', 'No internet service'] })
  @IsIn(['Yes', 'No', 'No internet service'])
  StreamingTV: string;

  @ApiProperty({ example: 'Yes', enum: ['Yes', 'No', 'No internet service'] })
  @IsIn(['Yes', 'No', 'No internet service'])
  StreamingMovies: string;

  @ApiProperty({ example: 'Month-to-month', enum: ['Month-to-month', 'One year', 'Two year'] })
  @IsIn(['Month-to-month', 'One year', 'Two year'])
  Contract: string;

  @ApiProperty({ example: 'Yes', enum: ['Yes', 'No'] })
  @IsIn(['Yes', 'No'])
  PaperlessBilling: string;

  @ApiProperty({
    example: 'Electronic check',
    enum: [
      'Electronic check',
      'Mailed check',
      'Bank transfer (automatic)',
      'Credit card (automatic)',
    ],
  })
  @IsIn([
    'Electronic check',
    'Mailed check',
    'Bank transfer (automatic)',
    'Credit card (automatic)',
  ])
  PaymentMethod: string;
}

export class PredictionResultDto {
  @ApiProperty({ example: 0.915, description: 'Probabilidad de churn (0 a 1)' })
  churn_probability: number;

  @ApiProperty({ example: 'alto', enum: ['bajo', 'medio', 'alto'] })
  risk_label: 'bajo' | 'medio' | 'alto';
}

export type PredictionResult = PredictionResultDto;

/**
 * Claves de las features que consume el modelo ML, en el mismo orden
 * que espera el microservicio FastAPI. Otros módulos (p.ej. customers)
 * la usan para extraer el subconjunto de features de sus propias entidades.
 */
export const ML_FEATURE_KEYS = [
  'SeniorCitizen',
  'tenure',
  'MonthlyCharges',
  'TotalCharges',
  'gender',
  'Partner',
  'Dependents',
  'PhoneService',
  'MultipleLines',
  'InternetService',
  'OnlineSecurity',
  'OnlineBackup',
  'DeviceProtection',
  'TechSupport',
  'StreamingTV',
  'StreamingMovies',
  'Contract',
  'PaperlessBilling',
  'PaymentMethod',
] as const;

export type MlFeatureKey = (typeof ML_FEATURE_KEYS)[number];
