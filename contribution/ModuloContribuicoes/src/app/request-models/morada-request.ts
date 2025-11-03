import { FilterRequest } from "./utils-request";

export interface MoradaListagemRequest {
  id: number;
  filter: FilterRequest;
}

export interface MoradaRequest {
  morada: MoradaDataContract;
}

export interface MoradaDataContract {
  idMorada: number;
  moradaAldeiaFk?: number;
  rua: string;
  numPorta: string;
  moradaPaisFk: number;
  moradaPrincipal: boolean;
  idEntidadeEmpreg?: number;
  idTrabalhador?: number;
}

export interface MoradaDeleteRequest {
  id: number;
}
