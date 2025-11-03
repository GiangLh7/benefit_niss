export interface Declaracao {
    idDeclaracao: number;
    declaracaoRelEntidadeTrabalhadorFk: number;
    diasContrato: number;
    diasEfecTrabalhados: number;
    faltasInjustific: number;
    diasParentalidade: number;
    diasTrabcontabSegSocial: number;
    remunDeclarada: number;
    decimoTerceiro?: number;
    mesAno: Date;
    flagImportado: boolean;
    contaCorrenteFk : number;
    oficioso: boolean;
    nacionalidade: number;
    regime: number;
    sexo: number;
}
