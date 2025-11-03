export interface FuncionalidadesListagemResponse {
  rows: number;
  funcionalidade: FuncionalidadesListagem[];
  perfilFuncionalidade: FuncionalidadesListagem[];
}


export interface FuncionalidadesListagem {
  id: number;
  descricao: string;
  create:boolean;
  read:boolean;
  update:boolean;
  delete:boolean;
}
