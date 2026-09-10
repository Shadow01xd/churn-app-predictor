import { api } from '../api/client';
import type { Customer, CustomerInput, RiskLabel } from './types';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ListParams {
  page?: number;
  limit?: number;
  risk?: RiskLabel;
  search?: string;
}

export function listCustomers(params: ListParams = {}) {
  return api
    .get<PaginatedResult<Customer>>('/customers', { params })
    .then((r) => r.data);
}

export function repredictCustomer(id: string) {
  return api.post<Customer>(`/customers/${id}/repredict`).then((r) => r.data);
}

export function getCustomer(id: string) {
  return api.get<Customer>(`/customers/${id}`).then((r) => r.data);
}

export function createCustomer(input: CustomerInput) {
  return api.post<Customer>('/customers', input).then((r) => r.data);
}

export function updateCustomer(id: string, input: Partial<CustomerInput>) {
  return api.patch<Customer>(`/customers/${id}`, input).then((r) => r.data);
}

export function deleteCustomer(id: string) {
  return api.delete(`/customers/${id}`).then(() => undefined);
}
