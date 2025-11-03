export interface ComponenteOrcamentoValor
{
    id: number;
    componenteOrcamentoRegistoFk: number;
    departamentoFk?: number;
    centroCustoFk?: number;
    agrupamentoFk: number;
    valor: number;
    tipoContaFk?: number;
}

export interface ComponenteOrcamentoValorFull
{
    id: number;
    componenteOrcamentoRegistoFk: number;
    departamentoFk?: number;
    centroCustoFk?: number;
    departamentoDescricao: string;
    centroCustoDescricao: string;
    agrupamentoFk: number;
    valor: number;
    tipoDeConta: number;
    tipoDeContaDescricao: string;
    codigo: string;
    descricao: string;
    editavel: boolean;
}

export interface ComponenteOrcamentoValorSearch
{
    id: number;
    departamentos?: number[];
    centrosDeCusto?: number[];
    tiposDeConta?: number[];
}
