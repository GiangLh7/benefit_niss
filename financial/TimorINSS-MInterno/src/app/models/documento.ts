export interface Documento {
  idDocumento: number;
  idTrabalhador: number;
  idResponsavelLegal: number;
  tpDocIdentificacao: number;
  numero: string;
  dataValidade: Date;
  dataEmissao: Date;
  localEmissao: string;
  documento: string;
  nomeDocumento: string;
}
