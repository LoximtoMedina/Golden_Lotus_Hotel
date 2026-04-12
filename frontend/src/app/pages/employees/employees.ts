// Librerías y tipos importados
import { Component, OnInit, signal } from '@angular/core'; // Componentes y señales de Angular
import { CommonModule } from '@angular/common'; // Para *ngIf
import { FormsModule } from '@angular/forms'; // Para [(ngModel)]
import { employeesApi } from '../../features/employees/api'; // API para empleados
import type { components } from '../../types/api'; // Tipos generados a partir de la API
import { SharedComponent } from '../../components/shared-layout/shared'; // Importa el componente compartido

// Tipos para clientes y parámetros de listado
type Employee = components['schemas']['Employee'];
type ListEmployeesParams = Parameters<typeof employeesApi.list>[0];

import { AuthenticatedLayout } from '../../layouts/authenticated-layout/authenticated-layout';

// Componente principal para la gestión de empleados
@Component({
  selector: 'app-employees',
  imports: [CommonModule, FormsModule, SharedComponent, AuthenticatedLayout],
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

  // Inicialización de la lista de clientes al cargar el componente
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

  // MODALS
  // 1. Variables de control para los Modals
  showFormModal: boolean = false;
  showDeleteModal: boolean = false;
  isEditing: boolean = false;
  EntityType: string = 'client';

  // 2. Objeto para el formulario
  currentData: any = {
    id: null,
    name: '',
    status: 'active',
  };

  // 3. Funciones para abrir/cerrar modals y preparar datos
  openAddModal() {
    this.isEditing = false;
    this.currentData = {
      id: null,
      name: '',
      identityNumber: '',
      phone: '',
      active: true,
      creationDate: new Date().toISOString(),
    };
    this.showFormModal = true;
  }

  openEditModal(client: any) {
    this.isEditing = true;
    this.currentData = { ...client };
    this.showFormModal = true;
  }

  openDeleteModal(client: any) {
    this.currentData = { ...client };
    this.showDeleteModal = true;
  }

  closeModals() {
    this.showFormModal = false;
    this.showDeleteModal = false;
  }

  // Funciones de acción

  saveEntity() {
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
