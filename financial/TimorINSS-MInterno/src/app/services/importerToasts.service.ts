import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class ImporterToastsService {

  private onCompleteEvent: BehaviorSubject<{[key: string]: EventEmitter<any>}> = new BehaviorSubject<{[key: string]: EventEmitter<any>}>({});
  public onCompleteEvent$: Observable<{[key: string]: EventEmitter<any>}> = this.onCompleteEvent.asObservable();
  private types: BehaviorSubject<{ [id: string]: string }> = new BehaviorSubject<{ [id: string]: string }>({});
  public types$: Observable<{ [id: string]: string }> = this.types.asObservable();
  private toasts: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  public toasts$: Observable<string[]> = this.toasts.asObservable();

  add(id: string, onComplete: EventEmitter<any>, type: string) {
    const newList = [...this.toasts.value, id];
    const newTypes = { ...this.types.value, [id]: type };
    const newOnCompleteEvent = { ...this.onCompleteEvent.value, ...{ [id]: onComplete }}

    this.toasts.next(newList);
    this.types.next(newTypes);
    this.onCompleteEvent.next(newOnCompleteEvent);
  }

  remove(id: string) {
    const newList = [...this.toasts.value ];
    newList.splice(newList.indexOf(id), 1);

    const newTypes = {...this.types.value };
    delete newTypes[id];

    const newOnCompleteEvent = { ...this.onCompleteEvent.value };
    delete newOnCompleteEvent[id];

    this.toasts.next(newList);
    this.types.next(newTypes);
    this.onCompleteEvent.next(newOnCompleteEvent);
  }


}



