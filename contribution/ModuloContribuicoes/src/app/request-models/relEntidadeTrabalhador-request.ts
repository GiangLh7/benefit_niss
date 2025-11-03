import { RelEntidadeTrabalhador, RelEntidadeTrabalhadorRegime } from "../models/relEntidadeTrabalhador";

export interface RelEntidadeTrabalhadorRequest {
  relEntidadeTrabalhador: RelEntidadeTrabalhador;
}

export interface RelEntidadeTrabalhadorRegimeRequest {
  relEntidadeTrabalhadorRegime: RelEntidadeTrabalhadorRegime;
}

export interface DesvincularTrabalhadorRequest {
  dataFimdeVinculo: Date;
  idRelEntidadeTrabalhador: number;
}

export interface TrabalhadorViewListagemRequest {
  id: number;
}
