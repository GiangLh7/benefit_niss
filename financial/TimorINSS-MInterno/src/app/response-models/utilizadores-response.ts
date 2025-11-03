export interface UtilizadoresListagemResponse {
  rows: number;
  utilizador: UtilizadoresListagem[];
}


export interface UtilizadoresListagem {
  id: number;
  idTrabalhador: number;
  utilizador: string;
  departamento: string;
  perfil:string;
  idPerfil: number [];
}

export interface DadosUtilizador{
  id:number;
  idTrabalhador: number;
  nome: string;
  tpDocIdentificacao:number;
  numero: string;
  dataValidade: Date;
}

export interface UtilizadoresAcessoListagemResponse {
  rows: number;
  utilizador: UtilizadoresAcessoListagem[];
}

export interface UtilizadoresAcessoListagem {
  id: number;
  nome: string;
  utilizador: string;
  departamento: string;
  perfil:string;
  interno: boolean;
  locked: boolean;
}
