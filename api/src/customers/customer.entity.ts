import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ── Identificación ─────────────────────────────────────────────────────────
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  // ── Features del modelo ML ─────────────────────────────────────────────────
  // Numéricas
  @Column({ type: 'int', default: 0 })
  SeniorCitizen: number;

  @Column({ type: 'int' })
  tenure: number;

  @Column({ type: 'double precision' })
  MonthlyCharges: number;

  @Column({ type: 'double precision' })
  TotalCharges: number;

  // Categóricas
  @Column()
  gender: string;

  @Column()
  Partner: string;

  @Column()
  Dependents: string;

  @Column()
  PhoneService: string;

  @Column()
  MultipleLines: string;

  @Column()
  InternetService: string;

  @Column()
  OnlineSecurity: string;

  @Column()
  OnlineBackup: string;

  @Column()
  DeviceProtection: string;

  @Column()
  TechSupport: string;

  @Column()
  StreamingTV: string;

  @Column()
  StreamingMovies: string;

  @Column()
  Contract: string;

  @Column()
  PaperlessBilling: string;

  @Column()
  PaymentMethod: string;

  // ── Últimos resultados de predicción ──────────────────────────────────────
  @Column({ type: 'double precision', nullable: true })
  churn_probability: number | null;

  @Column({ type: 'varchar', nullable: true })
  risk_label: 'bajo' | 'medio' | 'alto' | null;

  @Column({ type: 'timestamptz', nullable: true })
  predicted_at: Date | null;

  // ── Auditoría ─────────────────────────────────────────────────────────────
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
