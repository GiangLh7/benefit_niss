import { Contacto } from "../models/contacto";
import { Documento } from "../models/documento";
import { INSSEstrangeiro } from "../models/inssEstrangeiro";
import { Morada } from "../models/morada";
import { RelEntidadeTrabalhador } from "../models/relEntidadeTrabalhador";
import { Trabalhador } from "../models/trabalhador";
import { FilterRequest } from "./utils-request";

export interface TrabalhadorListagemRequest {
  id: number;
  filter: FilterRequest;
}

export interface TrabalhadorListagemNissRequest {
  niss?: string;
}

export interface SaveTrabalhadorRequest {
  trabalhador: Trabalhador;
  morada: Morada;
  contacto: Contacto
  relEntidadeTrabalhador: RelEntidadeTrabalhador;
  documentoIdentificacao: Documento;
  iNSSEstrangeiro?: INSSEstrangeiro;
}

export interface EditTrabalhadorRequest {
  trabalhador: Trabalhador;
}
