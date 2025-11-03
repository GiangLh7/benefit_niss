export interface ListagemDominios
{
    dominios: DominioDescricaoString[];
}

export interface SingleDominio
{
    dominio: DominioDescricaoString;
}

export interface ListagemRegimesResponse
{
    regimes: RegimeDescricaoString[];
}

export interface DominioDescricaoString
{
  id: number;
  value: number;
  descricao: string;
  indActivo?: boolean;
}

export interface RegimeDescricaoString
{
  id: number;
  value: number;
  descricao: string;
  indActivo?: boolean;
  tipoRegime: string;
}
