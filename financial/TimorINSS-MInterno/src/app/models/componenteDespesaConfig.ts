import { ComponenteListagem } from "../response-models/componente-response";


export interface ComponenteDespesaConfig {
    id: number;
    tarefaFk: number;
    registarDespesa: number;
    visualizarDespesaRParaA: number;
    visualizarDespesaAParaC: number;
    visualizarDespesaR: number;
    visualizarDespesaA: number;
    visualizarDespesaComCompromisso: number;
    visualiazarDespesaC: number;
    executarPagamentos: number;
    visualizarExecucaoDespesaCabimentada: number;
    emitirOrdemPagamento: number;
}


