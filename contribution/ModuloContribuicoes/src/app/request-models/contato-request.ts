import { FilterRequest } from "./utils-request";

export interface ContatoListagemRequest {
  Id: number;
  filter: FilterRequest;
}

export interface ContatoRequest {
  contato: ContactoDataContract;
}

export interface ContactoDataContract {
    idContacto: number;
    idTrabalhador?: number;
    idEntidade?: number;
    telemovel: string;
    email: string;

}

export interface ContatoDeleteRequest {
  id: number;
}
