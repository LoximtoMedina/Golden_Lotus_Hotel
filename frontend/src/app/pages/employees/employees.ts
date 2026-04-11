import { Component, OnInit, signal } from '@angular/core';
import { employeesApi } from '../../features/employees/api';
import type { components } from '../../types/api';

type Employee = components['schemas']['Employee'];

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

  // NG when the page loads 
  async ngOnInit(): Promise<void> {
    this.loading.set(true);

    try {
      const response = await employeesApi.list({
        page: 0,
        count: 20,
        includeDeleted: false,
        sort: {
          order: 'desc',
        },
      });

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
