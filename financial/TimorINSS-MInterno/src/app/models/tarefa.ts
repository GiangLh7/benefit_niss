import { ComponenteListagem } from "../response-models/componente-response";

export interface Tarefa{
    id: number;
    nome: string;
}


export interface ComponenteTexto {
    id: number;
    expandir1: boolean;
    expandir2: boolean;
    texto1: boolean;
    texto2: boolean;
    titulo1: string;
    titulo2: string;
    quantCaracteres1: number;
    quantCaracteres2: number;
    obrigatorio1: boolean;
    obrigatorio2: boolean;
    obrigatorioArquivar1: boolean;
    obrigatorioArquivar2: boolean;

}

export interface ComponenteAccoesTarefa{
    id:number;
    idTarefa: number;
    nomeTarefa: string;
    apelidoTarefa: string;
}

export interface ComponenteDocumentoTarefa{
    id: number;
    idDocumento: number;
    nomeDocumento: string;
    obrigatorio: boolean;
}

export interface ComponenteClassificacaoSubClassificTarefa{
    id:number;
    idClassificacao: number;
    nomeClassificacao: string;
    idSubClassificacao: number;
    nomeSubClassificacao: string;
}

export interface ComponenteAcessoPerfil{
    id:number;
    idPerfil: number;
    nomePerfil: string;
}

export interface ComponenteAcessoUtilizador{
    id:number;
    idUtilizador: number;
    nomeUtilizador: string;
}


export interface ComponenteDespesa {
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

export interface ComponenteConciliacaoMovimentos
{
    id: number;
    tarefaFk: number;
    permissaoSelecionarMovimentos: number;
    permissaoMovimentosConciliar: number;
    permissaoMovimentosBancarios: number;
    permissaoVerMovimentosAconciliar: number;
    permissaoConciliar: number;
    permissaoDesfazerConciliar: number;
}


export interface ComponenteReceita {
    id: number;
    tarefaFk: number;
    classificarMovSelecionados: number;
    selecionarMovRecebidosParaRegisto: number;
    verificarExecucaoOrcamentoEditarSelecao: number;
}
