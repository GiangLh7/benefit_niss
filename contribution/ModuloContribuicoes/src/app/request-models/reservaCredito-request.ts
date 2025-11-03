import { FilterRequest } from "./utils-request";

export interface ReservaCreditoListagemRequest {
  idEntidade: number;
  filter: FilterRequest;
}