import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  imports: [],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {
  query = signal('');

  @Input() placeholder: string = '';
  @Input() textButton: string = '';
  @Output() onSearch = new EventEmitter<string>();

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch.emit(this.query());
    } else {
      this.query.set((event.target as HTMLInputElement).value);
    }
  }
}
