import { PagamentoExecutado } from "./pagamentos_executados";

export interface Destinatario
{
  id: number;
  entidadeFk?: number;
  trabalhadorFK?: number;
  niss: string;
  tin: string;
  nome: string;
  morada: string;
}
