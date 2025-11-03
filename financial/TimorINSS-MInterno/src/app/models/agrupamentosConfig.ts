export interface AgrupamentosConfig
{
  id: number;
  designacao: string;
  tipoDeConta: number;
  parentFk?: number;
  final: boolean;
}
