export interface PreencherTarefa {
    cabecalho: CabecalhoComponent;
    classificacaoSubClass?: number;
    textos: TextosComponent;
    prazoTarefa: PrazoTarefaComponent;
    hasArchive: boolean;
    nextTarefaNumber?: number;
}

export interface CabecalhoComponent {
    numProcesso: string;
    nomeProcesso: string;
    nomeTarefa: string;
}

export interface TextosComponent {
    isExpanded: boolean;
    textTitle?: string;
    text: string;
    charLimit?: number;
    obrigatorio: boolean;
    obrigatorioAoArquivar?: boolean;
    isExpanded2: boolean;
    textTitle2?: string;
    text2: string;
    charLimit2?: number;
    obrigatorio2: boolean;
    obrigatorioAoArquivar2?: boolean;
    hasArquivar?: boolean;
}

export interface PrazoTarefaComponent {
    deadline: number;
    limitDate: Date;
}