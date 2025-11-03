export interface MovimentosDespesaReceita
{
    id: number,
    descricao: MovimentosPorConciliarDescricao,
    comprovativo: string,
    numeroDocumento: string,
    valor: number,
    conciliado: boolean,
    type: MovimentosPorConciliarListagemType,
    movimentoBancarioId?: number,
    tipoDocumento?: string,
    nomeComprovativo?: string
    editavel?: boolean,
    contabilidadeCredito: number,
    contabilidadeDebito: number,
    departamentoINSS: number,
    centroCusto: number,
    tipoConta: number,
    contaOSS: number,
    isClassificada?: boolean
}

export enum MovimentosPorConciliarListagemType {
    MovimentoAConciliar = 1,
    GuiaPagamento = 2,
    PagamentoExecutado = 3,
    ReservaCredito = 4
}

interface MovimentosPorConciliarDescricao {
    id?: number;
    descricao: string;
}

export interface MovimentosAConciliar {
    id: number;
    type: MovimentosPorConciliarListagemType
}
