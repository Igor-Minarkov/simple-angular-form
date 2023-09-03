import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss']
})
export class DisplayComponent implements OnInit {
  formData: any = {};
  csvData: any[] = [];

  ngOnInit() {
    this.formData = history.state.formData;
    this.csvData = history.state.csvData;
  }

  isValidCsvData(csvData: Record<string, unknown>[]): boolean {
    return csvData.every(row => !row['__parsed_extra']);
  }
  
}