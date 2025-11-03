import { Suspensao } from "../models/suspensao";
import { FilterRequest } from "./utils-request";

export interface SuspensaoListagemRequest {
  IdEntidade: number;
  IdTrabalhador?: number;
  filter: FilterRequest;
}

export interface SuspensaoRequest {
  suspensao: Suspensao;
}

export interface SuspensaoDeleteRequest {
  id: number;
}

