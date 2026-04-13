import { Component, EventEmitter, Input, Output } from '@angular/core';
import { components } from '../../../../types/api';
import { DatePipe } from '@angular/common'

type reservation = components['schemas']['Reservation'];
type Client = components['schemas']['Client'];
type PopulatedReservation = reservation & { client: Client };

@Component({
  selector: 'app-reservations-table',
  imports: [DatePipe],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table {
  @Input() records: PopulatedReservation[] = [];
  @Input() totalRecords: number = 0;

  @Output() onDeleteButtonClick = new EventEmitter<number>();
  @Output() onEditButtonClick = new EventEmitter<number>();
 
  handleEditButtonClick(id: number) {
    this.onEditButtonClick.emit(id);
  }
  
  handleDeleteButtonClick(id: number) {
    this.onDeleteButtonClick.emit(id);
  }
}
