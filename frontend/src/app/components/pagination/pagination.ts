import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface PageChangeEvent {
  page: number;
  pageSize: number;
}

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  @Input('currentPage') page: number = 0;
  @Input() totalRecords: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [10, 20, 50, 100];

  @Output() change = new EventEmitter<PageChangeEvent>();

  get totalPages(): number {
    return this.pageSize > 0 ? Math.ceil(this.totalRecords / this.pageSize) : 0;
  }

  get currentPage(): number {
    if (this.totalPages === 0) {
      return 0;
    }

    return Math.min(Math.max(this.page, 0), this.totalPages - 1);
  }

  get startRecord(): number {
    if (this.totalRecords === 0) {
      return 0;
    }

    return this.currentPage * this.pageSize + 1;
  }

  get endRecord(): number {
    if (this.totalRecords === 0) {
      return 0;
    }

    return Math.min((this.currentPage + 1) * this.pageSize, this.totalRecords);
  }

  get pageNumbers(): Array<number | 'ellipsis'> {
    const totalPages = this.totalPages;

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index);
    }

    const pages: Array<number | 'ellipsis'> = [0];
    const start = Math.max(1, this.currentPage - 1);
    const end = Math.min(totalPages - 2, this.currentPage + 1);

    if (start > 1) {
      pages.push('ellipsis');
    }

    for (let pageIndex = start; pageIndex <= end; pageIndex += 1) {
      pages.push(pageIndex);
    }

    if (end < totalPages - 2) {
      pages.push('ellipsis');
    }

    pages.push(totalPages - 1);

    return pages;
  }

  goToPage(nextPage: number): void {
    const boundedPage = Math.min(Math.max(nextPage, 0), Math.max(this.totalPages - 1, 0));

    if (boundedPage === this.page) {
      return;
    }

    this.page = boundedPage;
    this.emitChange();
  }

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const nextPageSize = Number(target.value);

    if (!Number.isFinite(nextPageSize) || nextPageSize <= 0 || nextPageSize === this.pageSize) {
      return;
    }

    this.pageSize = nextPageSize;
    this.page = 0;
    this.emitChange();
  }

  private emitChange(): void {
    this.change.emit({
      page: this.currentPage,
      pageSize: this.pageSize,
    });
  }
}
