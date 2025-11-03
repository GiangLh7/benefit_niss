import { MovimentosConciliados } from '../models/movimentosBancarios';



export interface ComponenteReceitaRegistoResponse
{
    rows: number;
    componenteReceita: ComponenteReceita[];
}


export interface ComponenteReceita
{
  id: number;
  idOrcamentoRegistoAprovado: number;
  tarefaAtivoFK: number;
  departamentoFk: number;
  centroCustoFk: number;
  tipoContaFk: number;
  codigoContaFk: number;
  agrupamentoConfigFk: number;
  descricao: string;
  valor: number|undefined;
  movimentos: MovimentosConciliados[];
  movimentosIds: number[];
}

export interface MovimentoReceita extends MovimentosConciliados {
  receita: ComponenteReceita;
}

