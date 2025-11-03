export interface Trabalhador {
  idTrabalhador: number;
  nome: string;
  niss?: string;
  tin: string;
  numInscProvisoria: string;
  dataNasc: Date;
  nomeMae: string;
  indDescNomeMae: boolean;
  nomePai: string;
  indDescNomePai: boolean;
  sexo: number;
  estadoCivil: number;
  nacionalidade: number;
  naturalidade: string;
}
