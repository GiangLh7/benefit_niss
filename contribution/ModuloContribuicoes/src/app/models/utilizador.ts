export interface Utilizador {
    id: number;
    username: string;
    niss: string;
    isInternal: boolean;
    indActivo: boolean;
    idEntidade: number;
}

export interface UtilizadorTrbalhador {
  id: number;
  idEntidadeEmpregadora: number;
}
