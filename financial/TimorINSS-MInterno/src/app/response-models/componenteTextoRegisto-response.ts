export interface ComponenteHistoricoTextoListagemResponse {
    historicoTextos: HistoryText[];
  }
  
export interface HistoryText {
    user: string;
    tarefa: string;
    titulo: string;
    texto: string;
    data: Date;
  }