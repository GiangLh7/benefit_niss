import * as internal from "stream";
import { SelectDescription } from "./utils";

export interface ValorCamposEditaveis
{
    id: number;
    nome: string;
    parentId?: number;
    parentHasInitialValue: boolean;
    parametros: ParametrosAdicionais[];
    naoEditavelEliminavel: boolean;
    hasKids: boolean;
}

export interface CamposEditaveisParents
{
    id: number;
    nome: string;
    valores: ValorCamposEditaveisParents[];
    indActivo: boolean;
}

export interface ValorCamposEditaveisParents
{
    id: number;
    nome: string;
}

export interface ParametrosAdicionais
{
  valor: string;
  dateValor?: Date;
  nome: string;
  type: string;
  size: string;
  suffix: string;
  optional: boolean;
  valuesList?: MultipleSelectAdditionalParameter[];
//   filteredValuesList?: MultipleSelectAdditionalParameter[];
  selectedValuesList?: number[];
  dateValorFormatted?: string;
  naoVisivel: boolean;
  dropdownList?: SelectDescription[];
  selectedDropdown?: number;
  credit?: boolean;
}

export interface MultipleSelectAdditionalParameter
{
    id: number;
    nome: string;
}
