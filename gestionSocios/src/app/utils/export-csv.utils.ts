import { GridApi } from 'ag-grid-community';

export function exportGridToCsv(gridApi: GridApi): void {
  const path = window.location.pathname.replace(/\//g, '_').replace(/^_/, '');
  const today = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
  const fileName = `${path}_${today}.csv`;

  gridApi.exportDataAsCsv({
    fileName,
    processCellCallback: (params) => {
      const value = params.value;
      if (typeof value === 'string' && value.startsWith('$ ')) {
        return value.replace('$ ', '').replace(/\./g, '').replace(',', '.');
      }
      return value;
    }
  });
}