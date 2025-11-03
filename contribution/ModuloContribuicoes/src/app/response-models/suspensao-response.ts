
export interface SuspensaoListagemResponse {
  rows?: number;
  suspensao?: SuspensaoListagem[];
}

export interface SuspensaoListagem {
  idSuspensao: number;
  idEntidade?: number;
  idTrabalhador?: number;
  dataInicioSuspensao: Date;
  dataFimSuspensao: Date;
}

