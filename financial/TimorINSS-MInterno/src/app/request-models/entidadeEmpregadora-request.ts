import { FilterRequest } from "./utils-request";

export interface ContatoListagemRequest {
  Id: number;
  filter: FilterRequest;
}

export interface EntidadeEmpregadoraRequest {
  EntidadeEmpregadora: EntidadeEmpregadoraDataContract;
}

export interface EntidadeEmpregadoraDataContract {
  IdEntidadeEmpreg? : number;
  Nome? : string;
  Niss? : string;
  Tin? : string;
  NumTrabalhador? : number;
  SituacInscricao? : string;
  DataInicioActiv? : Date;
  IdNaturezaJuridica?: number;
  IdActividadeEconomica?: number;
  IdSectorActividade?: number;
  DataInicioTrabServico? : Date;
  DtInscricao? : Date;
  DataFimActiv? : Date;
  DtHoraUltimoAcesso? : Date;
}

export interface EntidadeEmpregadoraIdRequest {
  idEntidade : number;
}
export interface EntidadeEmpregadoraNissRequest {
  niss? : string;
}

export interface UpsertEntidadeEmpregadoraDataContract {
  Id? : number;
  Nome : string;
  Niss? : string;
  Tin? : string;
  SituacInscricao? : string;
}

export interface UpsertEntidadeEmpregadoraRequest {
  EntidadeEmpregadora: UpsertEntidadeEmpregadoraDataContract;
}
