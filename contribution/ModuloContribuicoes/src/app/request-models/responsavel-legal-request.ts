import { Documento } from "../models/documento";
import { ResponsavelLegal } from "../models/responsavelLegal";
import { FilterRequest } from "./utils-request";

export interface ResponsavelLegalRequest {
    idEntidade: number;
    idTrabalhador?: number;
    dataInicioFuncao?: Date;
    dataFimFuncao?: Date;
    niss?: string;
    responsavelLegal: ResponsavelLegal;
    documentoIdentificacao: Documento[];
}

export interface ListResponsavelLegal {
    id: number;
    filter: FilterRequest;
}
export interface ResponsavelLegalDeleteRequest {
    id: number;
}
