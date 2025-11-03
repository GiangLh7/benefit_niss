export interface PerfisListagemResponse {
  rows: number;
  perfil: PerfisListagem[];
}

export interface PerfisAtivosListagemResponse {
  perfil: PerfisListagem[];
}
export interface PerfisListagem {
  id: number;
  dataCriacao: Date;
  descricao: string;
  indActivo:boolean;
}
