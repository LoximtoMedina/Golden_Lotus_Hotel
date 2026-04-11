import { Component, OnInit, signal } from '@angular/core';
import { employeesApi } from '../../features/employees/api';
import type { components } from '../../types/api';

type Employee = components['schemas']['Employee'];
type ListEmployeesParams = Parameters<typeof employeesApi.list>[0];

@Component({
  selector: 'app-employees',
  imports: [],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees implements OnInit {
  employees = signal<Employee[]>([]);
  loading = signal(false);
  error = signal('');
  total = signal(0);
  page = signal(1);
  count = signal(20);

  // NG when the page loads 
  async ngOnInit(): Promise<void> {
    await this.list({
      page: this.page(),
      count: this.count(),
      includeDeleted: false,
      sort: {
        order: 'desc',
      },
    });
  }

  async list(params: ListEmployeesParams): Promise<void> {
    this.page.set(params.page);
    this.count.set(params.count);
    this.loading.set(true);
    this.error.set('');

    try {
      const response = await employeesApi.list(params);

      const rows = response.data ?? [];
      this.employees.set(rows);
      this.total.set(response.total ?? rows.length);
    } catch (error) {
      console.log(error);
      this.error.set(error instanceof Error ? error.message : 'Failed to load employees');
    } finally {
      this.loading.set(false);
    }
  }
}
