export interface DespesaRegistada
{
  id: number;
  compromissos: number[];
  idContabilidade: number;
  codigoContabilidade: string;
  descricaoContabilidade: string;
  idOrcamento: number;
  codigoOrcamento: number;
  descricaoOrcamento: string;
  descricaoDespesa: string;
  valorRegistado: number;
  estado: string;
  idDepartamento?: number;
  idCentroCusto: number;
  idTipoConta: number;
}

export interface DespesaCabimentadasParaExecucao
{
  id: number;
  descricaoDespesa: string;
  valorCabimentado: number;
  valorExecutado: number;
  faltaExecutar: number;
}

export interface DespesaRelatorio
{
  id: number;
  departamentoINSS: string;
  centroCusto: string;
  tipoConta: string;
  contaOSS: string;
  descricao: string;
  valor: number;
  data: Date;
  numeroProcesso: string;
  utilizadorAlteracao: string;
}

export interface DespesaCompromisso
{
  id: number;
  descricaoDespesaCabimentada: string;
  descricaoCompromisso: string;
  valorCompromisso: number;
  dataCompromisso: Date;
  despesaRegistadaFk: number;
}
