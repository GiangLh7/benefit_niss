export interface Utilizador {
    id: number;
    username: string;
    niss: string;
    isInternal: boolean;
    idEntidade: number;
    permissions: Permission[];
    perfil: string;
}

export interface Permission {
    module: number;
    idFuncionalidade: number;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
}

export interface DadosUtilizadorResponse {
    id: number;
    idTrabalhador: number;
    nomeTrabalhador: string;
    documentoIdentificacao: string;
    numeroDocumento: string;
    dataValidade?: string;
    dataNascimento: string;
    email: string;
    telefone: string; 
}
