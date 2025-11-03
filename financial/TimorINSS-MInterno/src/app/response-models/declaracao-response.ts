import { Declaracao } from "../models/declaracao";

export interface GetDeclaracaoByEntidadeAndFilterResponse {
  declaracoes: DeclaracaoListagem[];
}

export interface DeclaracaoListagem {
  declaracao: Declaracao;
  trabalhadorInfo: DeclaracaoTrabalhadorInfo;
}

export interface DeclaracaoTrabalhadorInfo
{
  niss: string;
  nome: string;
  nacionalidade: string;
  regime: string;
  sexo: string;
  tipoRegime: string;
}

export interface ResumoDeclaracao
{
  nacionalidades: NacionalidadeResumoDeclaracao[];
  totalNacionalidades: NacionalidadeResumoDeclaracao;
  regimes: RegimesResumoDeclaracao[];
  total: TotalResumoDeclaracao;
}

export interface NacionalidadeResumoDeclaracao
{
  total: number;
  trabalhadores: number;
  nacionalidade: string;
}

export interface RegimesResumoDeclaracao
{
  remuneracoes: number;
  taxaTrabalhador?: number;
  taxaEntidade?: number;
  quotizacoes: number;
  contribuicoes: number;
  regime: string;
  total: number;
}

export interface TotalResumoDeclaracao
{
  remuneracoes: number;
  quotizacoes: number;
  contribuicoes: number;
  total: number;
}

export interface RelatoriosDeclaracaoListagemResponse {
  rows: number;
  declaracoes: RelatoriosDeclaracaoListagem[];
}

export interface RelatoriosDeclaracaoListagem {
  id: number;
  mesAno: Date;
  nomeEntidade: string;
  valorRenumeracoes: number;
  valorContribuicoes: number;
  valorPago: number;
  valorDivida: number;
}
