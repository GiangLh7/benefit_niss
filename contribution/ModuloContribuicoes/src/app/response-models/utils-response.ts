export interface SelectDescriptionResponse
{
    selects: SelectDescription[];
}

export interface SelectDescription
{
    id: number;
    nome: string;
    parentId?: number;
    indActivo: boolean;
}
