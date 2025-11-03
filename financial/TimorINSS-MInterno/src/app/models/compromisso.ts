export interface Compromisso
{
  id?: number;
  despesaRegistadaFk: number;
  nomeCompromisso: string;
  valorCompromisso: number;
  dataCompromisso: Date;
}