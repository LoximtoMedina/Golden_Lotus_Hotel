// Librerías y tipos importados
import { Component, OnInit, signal } from '@angular/core'; // Componentes y señales de Angular
import { CommonModule } from '@angular/common'; // Para *ngIf
import { FormsModule } from '@angular/forms'; // Para [(ngModel)]
import { clientsApi } from '../../features/clients/api'; // API para clientes
import type { components } from '../../types/api'; // Tipos generados a partir de la API
import { Pagination, type PageChangeEvent } from '../../components/pagination/pagination';

import { AuthenticatedLayout } from '../../layouts/authenticated-layout/authenticated-layout';

// Tipos para clientes y parámetros de listado
type client = components['schemas']['Client'];
type ListclientsParams = Parameters<typeof clientsApi.list>[0];

// Components for this page
import { Table as ClientsTable } from '../../features/clients/components/table/table';
import { SearchBar } from '../../components/search-bar/search-bar';
import { Switch } from '../../components/switch/switch';

// Componente principal para la gestión de clientes
@Component({
  selector: 'app-client',
  imports: [
    CommonModule,
    FormsModule,
    AuthenticatedLayout,
    ClientsTable,
    SearchBar,
    Switch,
    Pagination,
  ],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})

// Componente principal para la gestión de clientes
export class Clients implements OnInit {
  // Estado del componente utilizando señales
  clients = signal<client[]>([]);
  loading = signal(false);
  error = signal('');
  total = signal(0);
  page = signal(0);
  count = signal(20);
  showDeleted = signal(false);
  searchQuery = signal('');
  pageSizeOptions = [10, 20, 50, 100];

  // Inicialización de la lista de clientes al cargar el componente
  async ngOnInit(): Promise<void> {
    await this.loadPage();
  }

  // Función para construir los parámetros de la API a partir del estado actual
  private buildParams(page: number, count: number): ListclientsParams {
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
  async list(params: ListclientsParams): Promise<void> {
    this.page.set(params.page);
    this.count.set(params.count);
    this.loading.set(true);
    this.error.set('');

    // Llamada a la API para obtener la lista de clientes
    try {
      const response = await clientsApi.list(params);
      const rows = response.data ?? [];
      this.clients.set(rows);
      this.total.set(response.total ?? rows.length);
    } catch (error) {
      console.log(error);
      this.error.set(error instanceof Error ? error.message : 'Failed to load clients');
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
