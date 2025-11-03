import { ValoresDespesaRegistada } from '../models/despesa';
import { DespesaCabimentadasParaExecucao, DespesaCompromisso, DespesaRegistada, DespesaRelatorio } from '../models/despesaRegistada';
import { ValorCamposEditaveisSaveRequest } from '../request-models/camposEditaveis-request';


export interface GetComponenteDespesaRegistoReponse {
  componenteDespesaRegisto: DespesaRegistada[];
}


export interface GetValoresDespesaByIdCodigoOrcamentoResponse {
  valoresDespesa: ValoresDespesaRegistada;
}

export interface GetComponenteDespesaCabimentadaParaExecucaoReponse {
  despesasParaExecucao: DespesaCabimentadasParaExecucao[];
}

export interface GetDespesasRelatorioReponse {
  rows: number;
  despesas: DespesaRelatorio[];
}

export interface GetDespesasCompromissoResponse {
    componenteDespesaObrigacao: DespesaCompromisso[];
}
