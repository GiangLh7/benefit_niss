
export interface ContatoListagemResponse {
  rows?: number;
  contato?: ContatoListagem[];
}

export interface ContatoListagem {
  idContato: number;
  telemovel: string;
  email: string;
}

