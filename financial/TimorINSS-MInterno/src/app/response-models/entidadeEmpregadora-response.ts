
export interface EntidadeEmpregadoraConsultaResponse {
  idEntidadeEmpreg? : number;
  nome? : string;
  niss? : string;
  tin? : string;
  numTrabalhador? : number;
  situacInscricao? : string;
  dataInicioActiv? : Date;
  idNaturezaJuridica?: number;
  idActividadeEconomica?: number;
  idSectorActividade?: number;
  dataInicioTrabServico? : Date;
  dtInscricao? : Date;
  dataFimActiv? : Date;
  dtHoraUltimoAcesso? : Date;
}

export interface EntidadeEmpregadoraDeclaracaoViewResponse {
  idEntidadeEmpreg: number;
  nome: string;
  niss: string;
  tin: string;
  dataInicioDeclaracao: Date;
  dataFimActiv? : Date;
}
