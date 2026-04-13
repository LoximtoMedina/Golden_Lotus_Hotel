// Librerías y tipos importados
import { Component, OnInit, signal } from '@angular/core'; // Componentes y señales de Angular
import { CommonModule } from '@angular/common'; // Para *ngIf
import { FormsModule } from '@angular/forms'; // Para [(ngModel)]
import { employeesApi } from '../../features/employees/api'; // API para empleados
import type { components } from '../../types/api'; // Tipos generados a partir de la API
import { Pagination, type PageChangeEvent } from '../../components/pagination/pagination';
import { AuthenticatedLayout } from '../../layouts/authenticated-layout/authenticated-layout';
import { ChangeDetectorRef } from '@angular/core';

// Tipos para clientes y parámetros de listado
type Employee = components['schemas']['Employee'];
type ListEmployeesParams = Parameters<typeof employeesApi.list>[0];

// Components
import { Table as EmployeesTable } from '../../features/employees/components/table/table';
import { SearchBar } from '../../components/search-bar/search-bar';
import { Switch } from '../../components/switch/switch';
import { email } from '@angular/forms/signals';

// Componente principal para la gestión de empleados
@Component({
  selector: 'app-employees',
  imports: [
    CommonModule,
    FormsModule,
    AuthenticatedLayout,
    EmployeesTable,
    SearchBar,
    Switch,
    Pagination,
  ],
  templateUrl: './employees.html',
  styleUrls: ['./employees.css'],
})

// Componente principal para la gestión de empleados
export class Employees implements OnInit {
  // Estado del componente utilizando señales
  employees = signal<Employee[]>([]);
  loading = signal(false);
  error = signal('');
  total = signal(0);
  page = signal(0);
  count = signal(20);
  showDeleted = signal(false);
  searchQuery = signal('');
  pageSizeOptions = [10, 20, 50, 100];

  // Inicialización de la lista de empleados al cargar el componente
  async ngOnInit(): Promise<void> {
    await this.loadPage();
  }

  // Función para construir los parámetros de la API a partir del estado actual
  private buildParams(page: number, count: number): ListEmployeesParams {
    const searchQuery = this.searchQuery().trim();

    return {
      page,
      count,
      includeDeleted: this.showDeleted(),
      sort: {
        order: 'desc',
      },
      ...(searchQuery
        ? {
            search: {
              query: searchQuery,
              searchIn: ['name', 'identityNumber', 'phone'],
            },
          }
        : {}),
    };
  }

  // Función para cargar la página actual con los parámetros actuales
  private async loadPage(page = this.page(), count = this.count()): Promise<void> {
    await this.list(this.buildParams(page, count));
  }

  // Función para listar clientes con manejo de estado
  async list(params: ListEmployeesParams): Promise<void> {
    this.page.set(params.page);
    this.count.set(params.count);
    this.loading.set(true);
    this.error.set('');

    // Llamada a la API para obtener la lista de clientes
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

  // Funciones para manejar eventos de búsqueda, mostrar eliminados y paginación
  async handleSearch(query: string): Promise<void> {
    this.searchQuery.set(query);
    await this.loadPage(0, this.count());
  }

  // Maneja el cambio en el switch de mostrar eliminados
  async handleShowDeletedChange(show: boolean): Promise<void> {
    this.showDeleted.set(show);
    await this.loadPage(0, this.count());
  }

  // Maneja el cambio de página y tamaño de página en la paginación
  async handlePaginationChange({ page, pageSize }: PageChangeEvent): Promise<void> {
    await this.loadPage(page, pageSize);
  }

  // MODALS
  constructor(private cdr: ChangeDetectorRef) {}

  // 1. Variables de control para los Modals
  showFormModal: boolean = false;
  showDeleteModal: boolean = false;
  isEditing: boolean = false;
  EntityType: string = 'client';

  // 2. Objeto para el formulario
  currentData: any = {
    id: null,
    identityNumber: '',
    phone: '',
    salary: 12000,
    name: '',
    email: '',
    role: '',
    active: true,
    creationDate: new Date(),
  };

  // 3. Funciones para abrir/cerrar modals y preparar datos
  openAddModal() {
    this.isEditing = false;
    this.currentData = {
      id: null,
      identityNumber: '',
      phone: '',
      salary: 12000,
      name: '',
      email: '',
      role: '',
      active: true,
      creationDate: new Date(),
    };
    this.showFormModal = true;
  }

  async openEditModal(employee: any) {
    const result = await employeesApi.get({ employeeIds: [employee] });

    // @ts-ignore
    if (result.status === 'Success') {
      this.currentData = { ...result.data?.[0] };
      this.isEditing = true;
      this.showFormModal = true;

      this.cdr.detectChanges();
    }
  }

  async openDeleteModal(employee: any) {
    const result = await employeesApi.get({ employeeIds: [employee] });

    // @ts-ignore
    if (result.status === 'Success') {
      this.currentData = { ...result.data?.[0] };
      this.showDeleteModal = true;

      this.cdr.detectChanges();
    }
  }

  closeModals() {
    this.showFormModal = false;
    this.showDeleteModal = false;
  }

  // Funciones de acción
  async saveEntity() {
    if (this.isEditing) {
      console.log(`Actualizando ${this.EntityType}:`, this.currentData);
      // Aquí irá tu código para actualizar en el backend
    } else {
      console.log(`Guardando nuevo ${this.EntityType}:`, this.currentData);
      // Aquí irá tu código para guardar en el backend
    }
    this.closeModals();
  }

  deleteEntity() {
    console.log(`Eliminando ${this.EntityType} ID:`, this.currentData.id);
    // Aquí irá tu código para eliminar en el backend
    this.closeModals();
  }
}
