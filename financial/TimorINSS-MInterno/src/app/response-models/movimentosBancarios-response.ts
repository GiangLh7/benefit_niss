import { ContaBancaria } from "../models/contaBancaria";
import { MovimentosDespesaReceita } from "../models/movimentosDespesaReceita";
import { MovimentosBancariosData } from "../models/movimentosBancarios";
import { MovimentosConciliados } from "../models/movimentosBancarios";

export interface ContasBancariasListagemResponse 
{
    contas: ContaBancaria[];
}

export interface MovimentosDespesaReceitaListagemResponse
{
    rows: number;
    movimentos: MovimentosDespesaReceita[];
}

export interface MovimentosListagemResponse 
{
    rows: number;
    movimentos: MovimentosBancariosData[];
}

export interface MovimentoBancarioDropListResponse
{
    dominios: MovimentoBancarioDropListResponseDominions[];
}

export interface  MovimentoBancarioDropListResponseDominions
{
    id: number;
    descricao: string;
}

export interface MovimentosConciliadosResponse 
{
    rows: number;
    movimentos: MovimentosConciliados[];
}

export interface SaldoMovimentosResponse
{
    saldoConciliadoCredit: number;
    saldoConciliadoDebit: number;
    saldoConciliadoTotal: number;
    saldoPorConciliarCredit: number;
    saldoPorConciliarDebit: number;
    saldoPorConciliarTotal: number;
    saldoTotalCredit: number;
    saldoTotalDebit: number;
    saldoTotal: number;
}

export interface ConciliarMovimentosPermissionsListResponse
{
    selectMovimentosTypePermission: number;
    addEditMovimentosPermission: number;
    addEditMovimentosBancariosPermission: number;
    viewSelectedToConciliatePermission: number;
    conciliatePermission: number;
    undoConciliationPermission: number;
}