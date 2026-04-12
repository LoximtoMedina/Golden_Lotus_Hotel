import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shared-layout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shared.html'
})
export class SharedComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() iconPath: string = '';
  @Input() searchPlaceholder: string = '';
  @Input() buttonLabel: string = '';
  @Input() totalRecords: number = 0;

  @Output() onAdd = new EventEmitter<void>();
}