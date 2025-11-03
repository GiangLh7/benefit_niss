import { FilterRequest } from "./utils-request";

export interface ContaCorrenteListagemRequest {
  idEntidade?: number;
  idTrabalhador?: number;
  filter: FilterRequest;
}

export interface GetAllContasStatesFromYearByFilterRequest
{
  idEntidade: number;
  filter: FilterRequest;
}
