// Librerías y tipos importados
import { Component, OnInit, signal } from '@angular/core'; // Componentes y señales de Angular
import { CommonModule } from '@angular/common'; // Para *ngIf
import { FormsModule } from '@angular/forms'; // Para [(ngModel)]

import { roomsApi } from '../../features/rooms/api'; // API para empleados
import { components } from '../../types/api';

type Room = components['schemas']['Room'];
type ListRoomsParams = Parameters<typeof roomsApi.list>[0];

import { AuthenticatedLayout } from '../../layouts/authenticated-layout/authenticated-layout';

// Components
import { Table as RoomsTable } from '../../features/rooms/components/table/table';
import { SearchBar } from '../../components/search-bar/search-bar';
import { Switch } from '../../components/switch/switch';

@Component({
  selector: 'app-rooms',
  imports: [CommonModule, FormsModule, RoomsTable, SearchBar, AuthenticatedLayout, Switch],
  templateUrl: './rooms.html',
  styleUrls: ['./rooms.css'],
})
export class Rooms implements OnInit {
  // Estado del componente utilizando señales
  rooms = signal<Room[]>([]);
  loading = signal(false);
  error = signal('');
  total = signal(0);
  page = signal(0);
  count = signal(20);
  showDeleted = signal(false);

  // Inicialización de la lista de habitaciones al cargar el componente
  async ngOnInit(): Promise<void> {
    await this.list({
      page: this.page(),
      count: this.count(),
      includeDeleted: this.showDeleted(),
      sort: {
        order: 'desc',
      },
    });
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

  // Función para listar clientes con manejo de estado
  async list(params: ListRoomsParams): Promise<void> {
    this.page.set(params.page);
    this.count.set(params.count);
    this.loading.set(true);
    this.error.set('');

    // Llamada a la API para obtener la lista de clientes
    try {
      const response = await roomsApi.list(params);

      console.log(response);

      const rows = response.data ?? [];
      this.rooms.set(rows);
      this.total.set(response.total ?? rows.length);
    } catch (error) {
      console.log(error);
      this.error.set(error instanceof Error ? error.message : 'Failed to load rooms');
    } finally {
      this.loading.set(false);
    }
  }

  async handleSearch(query: string): Promise<void> {
    if (!query) {
      return this.list({
        page: 0,
        count: this.count(),
        includeDeleted: this.showDeleted(),
        sort: {
          order: 'desc',
        },
      });
    }
    await this.list({
      page: 0,
      count: this.count(),
      includeDeleted: this.showDeleted(),
      sort: {
        order: 'desc',
      },
      search: {
        query: query,
        searchIn: ['number', 'description'],
      },
    });
  }

  async handleShowDeletedChange(show: boolean): Promise<void> {
    this.showDeleted.set(show);
    await this.list({
      page: 0,
      count: this.count(),
      includeDeleted: show,
      sort: {
        order: 'desc',
      },
    });
  }

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
