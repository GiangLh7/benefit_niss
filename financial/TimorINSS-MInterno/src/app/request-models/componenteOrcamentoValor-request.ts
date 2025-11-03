import { ComponenteOrcamentoValor, ComponenteOrcamentoValorSearch } from "../models/componenteOrcamentoValor";

export interface AddComponenteOrcamentoValorRequest {
  componenteOrcamentoValor: ComponenteOrcamentoValor;
}

export interface SearchComponenteOrcamentoValorRequest {
  filter: ComponenteOrcamentoValorSearch;
}

export interface EliminarComponenteOrcamentoValorRequest {
  id: number;
}
