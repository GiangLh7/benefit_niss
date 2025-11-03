import { Documento } from "../models/documento";
import { FilterRequest } from "./utils-request";

export interface DocumentosListagemRequest {
  id: number;
  filter: FilterRequest;
}

export interface DocumentoRequest {
  documento: Documento;
}

export interface DocumentoIdRequest {
  id: number;
}

export interface TarefaDocumentoRequest {
  tarefaAtivoId: number;
  tipoDocumento: number;
  documento: string;
  nomeDocumento: string;
}
