import { Documento } from "../models/documento";
import { ResponsavelLegal } from "../models/responsavelLegal";

export interface ListResponsavelLegalResponse {
    dataInicioFuncao: Date;
    dataFimFuncao: Date;
    niss: string;
    responsavelLegal: ResponsavelLegal;
    documentoIdentificacao: Documento[];
}
  
export interface ResponsavelLegalListagemResponse {
    rows?: number;
    responsavelLegal?: ResponsavelLegalListagem[];
  }

export interface ResponsavelLegalListagem {
    idResponsavelLegal?: number;
    nome: string;
    tin: string;
    dataNascimento: Date;
    sexo: number;
    nacionalidade: number;
    naturalidade: string;
    funcao: number;
    funcaoString: string;
    funcaoOutro: string;
    indFuncaoRem: boolean;
    respLegalTabalhadorFk: number;
}
  