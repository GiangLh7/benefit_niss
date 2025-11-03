import { Contacto } from "../models/contacto";
import { Documento } from "../models/documento";
import { INSSEstrangeiro } from "../models/inssEstrangeiro";
import { Morada } from "../models/morada";
import { RelEntidadeTrabalhador } from "../models/relEntidadeTrabalhador";
import { Trabalhador } from "../models/trabalhador";

export interface TrabalhadorListagemResponse {
  rows: number;
  trabalhadores: TrabalhadorListagem[];
}

export interface VincularTrabalhadorListagemResponse {
  rows: number;
  trabalhadores: VincularTrabalhadorListagem[];
}

export interface TrabalhadorListagem {
  id: number;
  nome: string;
  regime: string;
  dtInicioDeVinculo: Date;
  dtFimDeVinculo?: Date;
  idRel?: number;
}

export interface VincularTrabalhadorListagem {
  id: number;
  nome: string;
  niss: string;
  nissProvisorio: string;
}

export interface GetTrabalhadorReponse {
  trabalhador: Trabalhador;
}

export interface TrabalhadorViewResponse {
  trabalhador: Trabalhador;
  relEntidadeTrabalhador: RelEntidadeTrabalhador;
  inssEstrangeiro: INSSEstrangeiro[];
}
