export interface Morada {
    IdMorada: number;
    MoradaAldeiaFk?: number;
    Rua: string;
    NumPorta: string;
    MoradaPaisFk: number;
    MoradaPrincipal: boolean;
    IdEntidadeEmpreg?: number;
    trabalhadorMoradaFk?: number;
}
