import { Documento } from "../models/documento";

export interface DocumentosListagemResponse {
  rows?: number;
  documentos?: DocumentoListagem[];
}

export interface DocumentoListagem {
  idDocumento: number;
  numero: string;
  dataValidade?: Date;
  tpDocIdentificacao: string;
  documento: string;
}

export interface DocumentoResponse {
  documento: Documento;
}
