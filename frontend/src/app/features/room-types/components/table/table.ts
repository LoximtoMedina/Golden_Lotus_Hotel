import { Component, EventEmitter, Input, Output } from '@angular/core';
import { components } from '../../../../types/api';

type RoomType = components['schemas']['RoomType'];

@Component({
  selector: 'app-room-types-table',
  imports: [],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table {
  @Input() records: RoomType[] = [];
  @Input() totalRecords: number = 0;

  @Output() onDeleteButtonClick = new EventEmitter<number>();
  @Output() onEditButtonClick = new EventEmitter<number>();
  @Output() onRestoreButtonClick = new EventEmitter<number>();
  
 
  handleEditButtonClick(id: number) {
    this.onEditButtonClick.emit(id);
  }
  
  handleDeleteButtonClick(id: number) {
    this.onDeleteButtonClick.emit(id);
  }

  handleRestoreButtonClick(id: number) {
    this.onRestoreButtonClick.emit(id);
  }
}
