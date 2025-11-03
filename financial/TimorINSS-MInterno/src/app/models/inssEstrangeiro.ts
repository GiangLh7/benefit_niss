export interface INSSEstrangeiro {
  idInssestrang: number;
  idEntidade?: number;
  idTrabalhador?: number;
  nomeSSEstrangeiro: string;
  estrangeiroPaisFk: number;
  indDecontAtualmente: Boolean;
  indBenfAtualmente: Boolean;
  documento: string;
  nomeDocumento: string;
  nissestrangeiro: string;
}
