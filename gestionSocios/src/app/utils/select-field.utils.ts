import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export function loadOptionsForField(
  serviceCall: any,
  fields: any[],
  fieldName: string,
  toast: any,
  mapFn: (item: any) => { label: string, value: any } = (item: any) => ({ label: item.nombre, value: item.id })
) {
  serviceCall.pipe(
    catchError(err => {
      toast.show(err.error.message, 'error');
      return of([]);
    })
  ).subscribe((data: any[]) => {
    const idx = fields.findIndex(f => f.name === fieldName);
    if (idx > -1) {
      fields[idx] = {
        ...fields[idx],
        options: [
          { label: '', value: '' },
          ...data.map(mapFn)
        ]
      };
    }
  });
}
