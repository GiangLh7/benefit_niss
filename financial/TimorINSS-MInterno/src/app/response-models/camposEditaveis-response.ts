import { CamposEditaveisParents, ParametrosAdicionais, ValorCamposEditaveis } from "../models/camposEditaveis";

export interface CamposEditaveisListagemResponse
{
  campos: CamposEditaveisListagem[];
}

export interface ValueCampoEditavelListagemResponse
{
  valuesCampo: ValorCamposEditaveis[];
  countValuesCampo: number;
  valuesCampoParents: CamposEditaveisParents;
  parametros: ParametrosAdicionais[];
}

export interface CamposEditaveisListagem
{
  idCampoEditavel: number;
  nome: string;
  dominioFk: number;
  campoPaiFk? : number;
  parametros: ParametrosAdicionais[];
  nomeNaoEditavel: boolean;
  naoEliminavel: boolean;
  naoPesquisavel: boolean;
  naoEditavel: boolean;
  unico: boolean;
  nomeSize: number;
}
