import { ComponenteReceitaRegisto } from "../models/componenteReceitaRegisto";
import { FilterRequest } from "./utils-request";

export interface RegistoReceitaRequest {
  componenteReceitaRegisto: ComponenteReceitaRegisto;
}

export interface GetComponenteReceitaRegistoByIdContaOSSRequest{
  contaOSSId: number;
  filter: FilterRequest;
}

export interface DeleteReceitaRequest{
  id: number;
  movimentoId: number;
}

export interface ReceitasNaoConciliadasRelatorioRequest extends FilterRequest {
  contribuinte?: string;
}


