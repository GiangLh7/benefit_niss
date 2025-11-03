export interface RelEntidadeTrabalhador {
  idRelEntidadeTrabalhador: number;
  entidadeFk: number;
  trabalhadorFk: number;
  tipoContrato: number;
  naturezaContrato: number;
  leiLabAplicavel: number;
  profissao: number;
  horasSemana?: number;
  diasSemana?: number;
  dtIniVincTrabalhador: Date;
  dtIniFimTrabalhador?: Date;
  funcPublico: boolean;
  numFuncPublico: string;
  regimeFk: number;
  escalaoFk?: number;
  profissaoOutro?: string;
}

export interface RelEntidadeTrabalhadorRegime {
  idRel: number;
  regimeFk: number;
  escalaoFk?: number;
}
