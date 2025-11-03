import { FuncionalidadesListagem } from "../response-models/funcionalidade-response";
import { FilterRequest } from "./utils-request";

export interface PerfilListagemRequest {
  filter: FilterRequest;
}

export interface PerfilUpdateRequest {
  id: number;
}

export interface PerfilRequest {
  descricao: String;
  idPerfil?: number;
  funcionalidade: FuncionalidadesListagem[];
}