import { FilterRequest } from "./utils-request";

export interface GetAgrupamentoConfigRequest {
  contaCodigoFk?: number;
  tipoContaFK: number;
  idOrcamento: number;
}

export interface GetExecucaoOrcamentalRelatoriosRequest extends FilterRequest {
  year: number;
  tipoConta: number;
}
