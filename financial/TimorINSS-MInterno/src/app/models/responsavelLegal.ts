export interface ResponsavelLegal {
    idResponsavelLegal?: number;
    nome: string;
    tin: string;
    dataNascimento: Date;
    sexo: number;
    nacionalidade: number;
    naturalidade: string;
    funcao: number;
    funcaoOutro?: string;
    indFuncaoRem: boolean;
    respLegalTabalhadorFk: number;
}
