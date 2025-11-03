import { AgrupamentosConfig } from '../models/agrupamentosConfig';
import { CodigoConta } from '../models/codigoConta';
import { ComponenteOrcamentoRegisto } from '../models/componenteOrcamentoRegisto';
import { ComponenteOrcamentoValorFull } from '../models/componenteOrcamentoValor';
import { PagamentoExecutado, PagamentoExecutadoDestinatario } from '../models/pagamentos_executados';
import { SelectDescription } from '../models/utils';
import { DominioDescricaoString } from './dominios-response';

export interface GetComponenteOrcamentoRegistoReponse {
  componenteOrcamentoRegisto: ComponenteOrcamentoRegisto;
  agrupamentos: AgrupamentosConfig[];
  centrosCusto: SelectDescription[];
  tiposDeConta: DominioDescricaoString[];
  valoresCorrentes: ComponenteOrcamentoValorFull[];
}

export interface UpdateComponenteOrcamentoRegistoDatesResponse {
  updateValues: boolean;
  agrupamentos: AgrupamentosConfig[];
  centrosCusto: SelectDescription[];
  tiposDeConta: DominioDescricaoString[];
}

export interface GetComponenteOrcamentoAprovadoRegistoReponse {
  idOrcamentoRegisto: number;
  centrosCusto: SelectDescription[];
  tiposDeConta: DominioDescricaoString[];
  codigoConta: CodigoConta[];
  existeOrcamentoAprovado: boolean;
  numPagamento: string;
  listaPagamentosDestinatario: PagamentoExecutadoDestinatario[];
  processoId: number;
}

export interface OrcamentoExtractToExcelReponse {
    excelExtraido: string;
}

export interface OrcamentoExtractToPDFReponse {
  pdfExtraido: string;
}
