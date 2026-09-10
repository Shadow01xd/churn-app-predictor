export type RiskLabel = 'bajo' | 'medio' | 'alto';

export interface Customer {
  id: string;
  name: string;
  email: string;

  // Features del modelo
  SeniorCitizen: number;
  tenure: number;
  MonthlyCharges: number;
  TotalCharges: number;
  gender: string;
  Partner: string;
  Dependents: string;
  PhoneService: string;
  MultipleLines: string;
  InternetService: string;
  OnlineSecurity: string;
  OnlineBackup: string;
  DeviceProtection: string;
  TechSupport: string;
  StreamingTV: string;
  StreamingMovies: string;
  Contract: string;
  PaperlessBilling: string;
  PaymentMethod: string;

  // Predicción
  churn_probability: number | null;
  risk_label: RiskLabel | null;
  predicted_at: string | null;

  createdAt: string;
  updatedAt: string;
}

/** Payload para crear/editar: identificación + las 19 features. */
export type CustomerInput = Omit<
  Customer,
  | 'id'
  | 'churn_probability'
  | 'risk_label'
  | 'predicted_at'
  | 'createdAt'
  | 'updatedAt'
>;

interface FieldBase {
  key: keyof CustomerInput;
  label: string;
}

interface NumberField extends FieldBase {
  type: 'number';
  step?: string;
  min?: number;
}

interface SelectField extends FieldBase {
  type: 'select';
  options: { value: string | number; label: string }[];
}

export type FeatureField = NumberField | SelectField;

const yesNo = [
  { value: 'Yes', label: 'Sí' },
  { value: 'No', label: 'No' },
];
const withInternet = [
  { value: 'Yes', label: 'Sí' },
  { value: 'No', label: 'No' },
  { value: 'No internet service', label: 'Sin internet' },
];

/** Definición declarativa de todos los campos del formulario de cliente. */
export const CUSTOMER_FIELDS: FeatureField[] = [
  {
    key: 'SeniorCitizen',
    label: 'Adulto mayor',
    type: 'select',
    options: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Sí' },
    ],
  },
  { key: 'tenure', label: 'Antigüedad (meses)', type: 'number', min: 0, step: '1' },
  {
    key: 'MonthlyCharges',
    label: 'Gasto mensual (USD)',
    type: 'number',
    min: 0,
    step: '0.01',
  },
  {
    key: 'TotalCharges',
    label: 'Gasto total (USD)',
    type: 'number',
    min: 0,
    step: '0.01',
  },
  {
    key: 'gender',
    label: 'Género',
    type: 'select',
    options: [
      { value: 'Female', label: 'Femenino' },
      { value: 'Male', label: 'Masculino' },
    ],
  },
  { key: 'Partner', label: 'Tiene pareja', type: 'select', options: yesNo },
  { key: 'Dependents', label: 'Tiene dependientes', type: 'select', options: yesNo },
  { key: 'PhoneService', label: 'Servicio telefónico', type: 'select', options: yesNo },
  {
    key: 'MultipleLines',
    label: 'Múltiples líneas',
    type: 'select',
    options: [
      { value: 'Yes', label: 'Sí' },
      { value: 'No', label: 'No' },
      { value: 'No phone service', label: 'Sin servicio telefónico' },
    ],
  },
  {
    key: 'InternetService',
    label: 'Servicio de internet',
    type: 'select',
    options: [
      { value: 'DSL', label: 'DSL' },
      { value: 'Fiber optic', label: 'Fibra óptica' },
      { value: 'No', label: 'No tiene' },
    ],
  },
  { key: 'OnlineSecurity', label: 'Seguridad online', type: 'select', options: withInternet },
  { key: 'OnlineBackup', label: 'Backup online', type: 'select', options: withInternet },
  {
    key: 'DeviceProtection',
    label: 'Protección de dispositivo',
    type: 'select',
    options: withInternet,
  },
  { key: 'TechSupport', label: 'Soporte técnico', type: 'select', options: withInternet },
  { key: 'StreamingTV', label: 'Streaming TV', type: 'select', options: withInternet },
  {
    key: 'StreamingMovies',
    label: 'Streaming películas',
    type: 'select',
    options: withInternet,
  },
  {
    key: 'Contract',
    label: 'Tipo de contrato',
    type: 'select',
    options: [
      { value: 'Month-to-month', label: 'Mes a mes' },
      { value: 'One year', label: 'Un año' },
      { value: 'Two year', label: 'Dos años' },
    ],
  },
  {
    key: 'PaperlessBilling',
    label: 'Factura electrónica',
    type: 'select',
    options: yesNo,
  },
  {
    key: 'PaymentMethod',
    label: 'Método de pago',
    type: 'select',
    options: [
      { value: 'Electronic check', label: 'Cheque electrónico' },
      { value: 'Mailed check', label: 'Cheque por correo' },
      { value: 'Bank transfer (automatic)', label: 'Transferencia bancaria (automática)' },
      { value: 'Credit card (automatic)', label: 'Tarjeta de crédito (automática)' },
    ],
  },
];

export const EMPTY_CUSTOMER: CustomerInput = {
  name: '',
  email: '',
  SeniorCitizen: 0,
  tenure: 0,
  MonthlyCharges: 0,
  TotalCharges: 0,
  gender: 'Female',
  Partner: 'No',
  Dependents: 'No',
  PhoneService: 'Yes',
  MultipleLines: 'No',
  InternetService: 'DSL',
  OnlineSecurity: 'No',
  OnlineBackup: 'No',
  DeviceProtection: 'No',
  TechSupport: 'No',
  StreamingTV: 'No',
  StreamingMovies: 'No',
  Contract: 'Month-to-month',
  PaperlessBilling: 'Yes',
  PaymentMethod: 'Electronic check',
};

export function riskColor(risk: RiskLabel | null): string {
  if (risk === 'alto') return 'var(--risk-high)';
  if (risk === 'medio') return 'var(--risk-mid)';
  if (risk === 'bajo') return 'var(--risk-low)';
  return 'var(--muted)';
}
