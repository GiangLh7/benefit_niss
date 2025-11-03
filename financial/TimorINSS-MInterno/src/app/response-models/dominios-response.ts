export interface ListagemDominios
{
    dominios: DominioDescricaoString[];
}

export interface DominioDescricaoString
{
  id: number;
  value: number;
  descricao: string;
  indActivo?: boolean;
}

export interface ListagemRegimesResponse
{
    regimes: RegimeDescricaoString[];
}

export interface RegimeDescricaoString
{
  id: number;
  value: number;
  descricao: string;
  indActivo?: boolean;
  tipoRegime: string;
}

export interface SingleDominio
{
    dominio: DominioDescricaoString;
}

export interface ListagemDominiosComGrupos
{
    dominio: DominiosComGrupos;
}

export interface DominiosComGrupos {
    groups: Group[];
}

export interface Group {
    name: string;
    disabled?: boolean;
    values: DominioDescricaoString[];
}
