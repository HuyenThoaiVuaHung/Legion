import { computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

/** A piece of view state kept in a query parameter, so a refresh or a pasted link restores it. */
export function queryParamState(name: string) {
  const route = inject(ActivatedRoute);
  const router = inject(Router);
  const params: Signal<ParamMap> = toSignal(route.queryParamMap, { initialValue: route.snapshot.queryParamMap });
  return {
    value: computed(() => params().get(name)),
    set: (value: string | null): void => {
      void router.navigate([], { relativeTo: route, queryParams: { [name]: value || null }, queryParamsHandling: 'merge', replaceUrl: true });
    },
  };
}
