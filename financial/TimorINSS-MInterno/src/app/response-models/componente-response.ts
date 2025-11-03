export interface ComponenteListagemResponse {
  componentes: ComponenteListagem[];
}


export interface ComponenteListagem {
  id: number;
  descricao: string;
  expandir: boolean;
  select: boolean
  ordem?: number;
}

