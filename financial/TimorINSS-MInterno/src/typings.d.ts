import { ObservableInput, Observable } from 'rxjs';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';

declare module 'rxjs/internal/observable/forkJoin' {
  export function forkJoin<T, T2, T3, T4, T5, T6, T7>(
    sources: [
      ObservableInput<T>,
      ObservableInput<T2>,
      ObservableInput<T3>,
      ObservableInput<T4>,
      ObservableInput<T5>,
      ObservableInput<T6>,
      ObservableInput<T7>
    ],
  ): Observable<[T, T2, T3, T4, T5, T6, T7]>;
  export function forkJoin<T, T2, T3, T4, T5, T6, T7>(
    v1: ObservableInput<T>,
    v2: ObservableInput<T2>,
    v3: ObservableInput<T3>,
    v4: ObservableInput<T4>,
    v5: ObservableInput<T5>,
    v6: ObservableInput<T6>,
    v7: ObservableInput<T7>,
  ): Observable<[T, T2, T3, T4, T5, T6, T7]>;
  export function forkJoin<T, T2, T3, T4, T5, T6, T7, T8>(
    sources: [
      ObservableInput<T>,
      ObservableInput<T2>,
      ObservableInput<T3>,
      ObservableInput<T4>,
      ObservableInput<T5>,
      ObservableInput<T6>,
      ObservableInput<T7>,
      ObservableInput<T8>,
    ],
  ): Observable<[T, T2, T3, T4, T5, T6, T7, T8]>;
  export function forkJoin<T, T2, T3, T4, T5, T6, T7, T8>(
    v1: ObservableInput<T>,
    v2: ObservableInput<T2>,
    v3: ObservableInput<T3>,
    v4: ObservableInput<T4>,
    v5: ObservableInput<T5>,
    v6: ObservableInput<T6>,
    v7: ObservableInput<T7>,
    v8: ObservableInput<T8>,
  ): Observable<[T, T2, T3, T4, T5, T6, T7, T8]>;
  export function forkJoin<T, T2, T3, T4, T5, T6, T7, T8, T9>(
    sources: [
      ObservableInput<T>,
      ObservableInput<T2>,
      ObservableInput<T3>,
      ObservableInput<T4>,
      ObservableInput<T5>,
      ObservableInput<T6>,
      ObservableInput<T7>,
      ObservableInput<T8>,
      ObservableInput<T9>,
    ],
  ): Observable<[T, T2, T3, T4, T5, T6, T7, T, T9]>;
  export function forkJoin<T, T2, T3, T4, T5, T6, T7, T8, T9>(
    v1: ObservableInput<T>,
    v2: ObservableInput<T2>,
    v3: ObservableInput<T3>,
    v4: ObservableInput<T4>,
    v5: ObservableInput<T5>,
    v6: ObservableInput<T6>,
    v7: ObservableInput<T7>,
    v8: ObservableInput<T8>,
    v9: ObservableInput<T8>,
  ): Observable<[T, T2, T3, T4, T5, T6, T7, T8, T9]>;
}
