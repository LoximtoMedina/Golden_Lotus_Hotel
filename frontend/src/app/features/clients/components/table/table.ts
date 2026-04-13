import { Component, EventEmitter, Input, Output } from '@angular/core';
import { components } from '../../../../types/api';

type Client = components['schemas']['Client'];

@Component({
  selector: 'app-clients-table',
  imports: [],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table {
  @Input() records: Client[] = [];
  @Input() totalRecords: number = 0;

  @Output() onDeleteButtonClick = new EventEmitter<void>();
  @Output() onEditButtonClick = new EventEmitter<void>();
 
  handleEditButtonClick() {
    this.onEditButtonClick.emit();
  }
  
  handleDeleteButtonClick() {
    this.onDeleteButtonClick.emit();
  }
}
