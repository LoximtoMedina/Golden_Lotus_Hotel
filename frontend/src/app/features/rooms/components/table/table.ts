import { Component, EventEmitter, Input, Output } from '@angular/core';
import { components } from '../../../../types/api';

type Room = components['schemas']['Room'];

@Component({
  selector: 'app-rooms-table',
  imports: [],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table {
  @Input() records: Room[] = [];
  @Input() totalRecords: number = 0;

  @Output() onDelete = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<void>();
}
