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

  @Output() onDelete = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<void>();
}
