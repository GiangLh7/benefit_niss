import { DepartamentoListagem } from "../response-models/departamento-response";
import { PerfisListagem } from "../response-models/perfis-response";
import { FilterRequest } from "./utils-request";

export interface UtilizadorListagemRequest {
  filter: FilterRequest;
}

export interface UtilizadorRequest{
  id: number;
  departamento: DepartamentoListagem[];
  perfil: PerfisListagem[];
}

export interface DadosUtilizadorRequest {
  idUtilizador: number;
  idTrabalhador: number;
}

export interface UserUpdateRequest {
  id: number;
}
