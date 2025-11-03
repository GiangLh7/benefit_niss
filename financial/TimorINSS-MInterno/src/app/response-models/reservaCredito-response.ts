export interface ReservaCreditoListagemResponse {
  rows: number;
  reservaCredito: ReservaCreditoListagem[];
}


export interface ReservaCreditoListagem {
  idEntidade: number;
  valor?: number;
  indAtivo: boolean;
}

