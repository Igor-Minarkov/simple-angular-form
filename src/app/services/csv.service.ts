import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';

@Injectable({
  providedIn: 'root',
})
export class CsvService {
  constructor() {}

  parseCsv(data: string): any[] {
    let parsedData: any[] = [];
    Papa.parse(data, {
      header: true,
      skipEmptyLines: true,
      complete: (result: any) => {
        parsedData = result.data;
      },
    });
    return parsedData;
  }
}
