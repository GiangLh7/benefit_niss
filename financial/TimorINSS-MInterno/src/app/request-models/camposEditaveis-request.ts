import { ValorCamposEditaveis } from "../models/camposEditaveis";
import { FilterRequest } from "./utils-request";

export interface ValorCamposEditaveisRequest
{
  campoEditavelId: number;
  filter: FilterRequest;
}

export interface ValorCamposEditaveisSaveRequest
{
  valorCampo: ValorCamposEditaveis;
  idCampo: number;
}

export interface RegimeCampoEditaveisSaveRequest
{
  valorCampo: ValorCamposEditaveis;
}

export interface ValorCamposEditaveisDeleteRequest
{
  idValorCampo: number;
  idCampo: number;
}
