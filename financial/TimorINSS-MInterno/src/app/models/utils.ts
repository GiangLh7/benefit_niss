export interface SelectDescription
{
    id: number;
    nome: string;
    parentId?: number;
    indActivo: boolean;
}

export enum Modules {
    GESTAO = 1,
    CONTRIBUICOES = 2,
    FINANCEIRO = 3,
    RELATORIOS = 4,
    BENEFIT = 5
}

export enum Funcionalidades {
    GestaoPerfil = 1,
    Auditoria = 2,
    CamposEditaveis = 3,
    GestaoUtilizador = 4,
    DeclaracaoRenum = 5,
    ContaCorrente = 6,
    GuiasPagamento = 7,
    EntidadeEmpregadora = 8,
    Trabalhadores = 9,
    Tarefa = 10,
    ProcessosConfig = 11,
    PreenchimentoTarefa = 12,
    ControlodeAcessodeUtilizadores = 13,
    Relatorios = 14,
    Consultas = 15
}

export interface MenuItem
{
    name: string;
    icon?: string;
    link?: string;
    category?: boolean;
    children?: MenuItem[];
    order: number;
}

export enum SelectType {
    single,
    multiple
  }