import { ComponenteAccoesTarefa, ComponenteAcessoPerfil, ComponenteAcessoUtilizador, ComponenteClassificacaoSubClassificTarefa, ComponenteDocumentoTarefa } from "../models/tarefa";
import { ComponenteListagem } from "../response-models/componente-response";

export interface UpdateRelTarefaComponenteRequest{
  idTarefa: number;
  componenteListagem: ComponenteListagem[];
}

export interface GetAllRelTarefaComponenteByIdTarefaActivoRequest{
  idTarefaActivo: number;
}
