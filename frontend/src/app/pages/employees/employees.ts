import { Component, OnInit } from '@angular/core';
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
  employees: Employee[] = [];
  loading = false;
  error = '';
  total = 0;

  async ngOnInit(): Promise<void> {
    this.loading = true;

    try {
      const response = await employeesApi.list({
        page: 0,
        count: 20,
        includeDeleted: false,
        sort: {
          order: 'desc',
        }
      });

      this.employees = response.data ?? [];
      this.total = response.total ?? this.employees.length;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to load employees';
    } finally {
      this.loading = false;
    }
  }
}
