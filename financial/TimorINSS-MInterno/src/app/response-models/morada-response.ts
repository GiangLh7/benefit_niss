
export interface MoradaListagemResponse {
  rows?: number;
  morada?: MoradaListagem[];
}

export interface MoradaListagem {
  idMorada: number;
  idEntidadeEmpreg: number;
  rua: string;
  municipio: string;
  idMunicipio:number;
  postoAdministrativo: String;
  idPostoAdministrativo: number;
  suco: String;
  idSuco: number;
  aldeia: String;
  idAldeia: number
  pais:String;
  idPais: number;
  moradaPrincipal: boolean;
  numPorta: string;
  ruaNumPorta: string;
}

