import { Destinatario } from "../models/destinatario";

export interface GetDestinatarioRequest {
  niss: string;
  tin: string;
  nome:string;
}

export interface SaveDestinatarioRequest {
  destinatario: Destinatario
}


