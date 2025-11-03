export class FilterRequest {
  index?: number;
  rows?: number;
  dateFilterBegin?: Date;
  dateFilterEnd?: Date;
  filterField?: string;
  filterBy?: string;
  orderBy? : string;
  orderDirection? : OrderDirectionEnum;
  filter? : FilterRequest;
}

export interface approveComprovativoPagamentoRequest{
  idEntidade: number;
  idGuia: number;
  valorComprovativoPag: number;
  dataComprovativoPag: Date;
  comprovativoPag: string;
  rejectReason: string;
  rejectStatus: string;

}

export enum OrderDirectionEnum {
  ascending = 1,
  descending = 2,
}
