export interface DepartamentoListagemResponse {
  rows: number;
  departamento: DepartamentoListagem[];
}


export interface DepartamentoListagem {
  id: number;
  nome: string;
}
