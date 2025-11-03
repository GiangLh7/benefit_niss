export interface ComponenteOrcamentoRegisto
{
    id: number;
    tarefaActivoFk: number;
    dataInicio: Date;
    dataFim: Date;
    aprovado: boolean;
    orcamentoConfigFk: number;
    orcamentoRetificadoFk?:number;
}
