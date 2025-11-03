export interface MovimentosBancariosData 
{
    id: number;
    tarefaAtivoId?: number;
    descricao: string;
    dataValor: Date;
    credito?: number;
    debito?: number;
    conciliado: boolean;
}

export interface MovimentosPorConciliar
{
    id:number;
    tarefaAtivoId?: number;
    descricao: string;
    valor: number;
    tipoDocumento: string;
    numeroDocumento:string;
    comprovativo: string;
}

export interface MovimentosConciliados
{
    id:number;
    tarefaAtivoId?: number;
    descricao: string;
    valor: number;
    tipoDocumento: string;
    numeroDocumento:string;
    comprovativo: string;
    checked: boolean;
}