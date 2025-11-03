import { NumberValueAccessor } from "@angular/forms";
import { DateAdapter } from "@angular/material/core";

export interface EntidadeEmpregadoraConsultaResponse {
  idEntidadeEmpreg?: number;
  nome?: string;
  niss?: string;
  tin?: string;
  numTrabalhador?: number;
  situacInscricao?: string;
  dataInicioActiv?: Date;
  idNaturezaJuridica?: number;
  idActividadeEconomica?: number;
  idSectorActividade?: number;
  dataInicioTrabServico?: Date;
  dtInscricao?: Date;
  dataFimActiv?: Date;
  dtHoraUltimoAcesso?: Date;
}
