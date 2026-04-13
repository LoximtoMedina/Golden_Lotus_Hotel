// Librerías y tipos importados
import { Component, OnInit, signal } from '@angular/core'; // Componentes y señales de Angular
import { CommonModule } from '@angular/common'; // Para *ngIf
import { FormsModule } from '@angular/forms'; // Para [(ngModel)]
import { reservationsApi } from '../../features/reservations/api'; // API para reservas
import type { components } from '../../types/api'; // Tipos generados a partir de la API
import { Pagination, type PageChangeEvent } from '../../components/pagination/pagination';
import { AuthenticatedLayout } from '../../layouts/authenticated-layout/authenticated-layout';

// Tipos para reservas, clientes y parámetros de listado
type reservation = components['schemas']['Reservation'];
type Client = components['schemas']['Client'];
type PopulatedReservation = reservation & { client: Client };
type ListreservationsParams = Parameters<typeof reservationsApi.list>[0];

// Components
import { Table as ReservationsTable } from '../../features/reservations/components/table/table';
import { SearchBar } from '../../components/search-bar/search-bar';
import { Switch } from '../../components/switch/switch';

// Componente principal para la gestión de empleados
@Component({
  selector: 'app-reservations',
  imports: [
    CommonModule,
    FormsModule,
    AuthenticatedLayout,
    ReservationsTable,
    SearchBar,
    Switch,
    Pagination,
  ],
  templateUrl: './reservations.html',
  styleUrls: ['./reservations.css'],
})

// Componente principal para la gestión de empleados
export class reservations implements OnInit {
  // Estado del componente utilizando señales
  reservations = signal<PopulatedReservation[]>([]);
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
    await this.list({
      page: this.page(),
      count: this.count(),
      includeDeleted: this.showDeleted(),
      sort: {
        order: 'desc',
      },
    });
  }

  // Función para construir los parámetros de la API a partir del estado actual
  private buildParams(page: number, count: number): ListreservationsParams {
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
              searchIn: ['status'],
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
  async list(params: ListreservationsParams): Promise<void> {
    this.page.set(params.page);
    this.count.set(params.count);
    this.loading.set(true);
    this.error.set('');

    // Llamada a la API para obtener la lista de clientes
    try {
      const response = await reservationsApi.list(params);

      const rows = response.data ?? [];
      this.reservations.set(rows as PopulatedReservation[]);
      this.total.set(response.total ?? rows.length);
    } catch (error) {
      console.log(error);
      this.error.set(error instanceof Error ? error.message : 'Failed to load reservations');
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

  async openEditModal(reservation: any) {
    const result = await reservationsApi.get({ reservationIds: [reservation] });

    // @ts-ignore
    if (result.status === 'Success') {
      this.currentData = { ...result.data?.[0] };
    }

    this.isEditing = true;
    this.showFormModal = true;
  }

  async openDeleteModal(reservation: any) {
    const result = await reservationsApi.get({ reservationIds: [reservation] });

    // @ts-ignore
    if (result.status === 'Success') {
      this.currentData = { ...result.data?.[0] };
    }

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
