// Librerías y tipos importados
import { Component, OnInit, signal } from '@angular/core'; // Componentes y señales de Angular
import { CommonModule } from '@angular/common'; // Para *ngIf
import { FormsModule } from '@angular/forms'; // Para [(ngModel)]
import { reservationsApi } from '../../features/reservations/api'; // API para reservas
import type { components } from '../../types/api'; // Tipos generados a partir de la API
import { Pagination, type PageChangeEvent } from '../../components/pagination/pagination';
import { ChangeDetectorRef } from '@angular/core';
import clientsApi from '../../features/clients/api';
import { roomsApi } from '../../features/rooms/api';

// Tipos para reservas, clientes y parámetros de listado
type reservation = components['schemas']['Reservation'];
type Client = components['schemas']['Client'];
type Room = components['schemas']['Room'];
type PopulatedReservation = reservation & { client: Client; room: Room };
type ListreservationsParams = Parameters<typeof reservationsApi.list>[0];

interface ClientList {
  id: number;
  name: string;
}

interface RoomList {
  id: number;
  number: string;
  description: string;
}

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

  clients = signal<ClientList[]>([]);
  rooms = signal<RoomList[]>([]);

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

    // Cargar clientes para el formulario
    try {
      const clientResponse = await clientsApi.list({ page: 0, count: 100 });
      const clientRows = clientResponse.data ?? [];
      this.clients.set(clientRows.map((c) => ({ id: c.id, name: c.name })));
    } catch (error) {
      console.log(error);
    }

    // Cargar habitaciones para el formulario
    try {
      const roomResponse = await roomsApi.list({ page: 0, count: 100 });
      const roomRows = roomResponse.data ?? [];
      this.rooms.set(
        roomRows.map((r) => ({ id: r.id, number: r.number, description: r.description })),
      );
    } catch (error) {
      console.log(error);
    }
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
  constructor(private cdr: ChangeDetectorRef) {}

  // 1. Variables de control para los Modals
  showFormModal: boolean = false;
  showDeleteModal: boolean = false;
  isEditing: boolean = false;
  EntityType: string = 'client';

  // 2. Objeto para el formulario
  currentData: any = {
    id: null,
    clientId: null,
    roomId: null,
    status: 'Pending',
    checkInDate: new Date(),
    checkOutDate: new Date(),
    charge: 0,
    active: true,
    creationDate: new Date(),
  };

  // 3. Funciones para abrir/cerrar modals y preparar datos
  openAddModal() {
    this.isEditing = false;
    this.currentData = {
      id: null,
      clientId: null,
      roomId: null,
      status: 'Pending',
      checkInDate: new Date(),
      checkOutDate: new Date(),
      charge: 0,
      active: true,
      creationDate: new Date(),
    };
    this.showFormModal = true;
  }

  async openEditModal(reservation: any) {
    const result = await reservationsApi.get({ reservationIds: [reservation] });

    // @ts-ignore
    if (result.status === 'Success') {
      this.currentData = { ...result.data?.[0] };

      this.isEditing = true;
      this.showFormModal = true;

      this.cdr.detectChanges();
    }
  }

  async openDeleteModal(reservation: any) {
    const result = await reservationsApi.get({ reservationIds: [reservation] });

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

  async updateEntity() {
    console.log(`Actualizando ${this.EntityType} ID:`, this.currentData);

    const result = await reservationsApi.update({
      reservationId: this.currentData.id,
      clientId: this.currentData.clientId,
      roomId: this.currentData.roomId,
      status: this.currentData.status,
      checkInDate: new Date(this.currentData.checkInDate).toISOString(),
      checkOutDate: new Date(this.currentData.checkOutDate).toISOString(),
      charge: this.currentData.charge,
      active: true,
    });

    // @ts-ignore
    if (result.status === 'Success') {
      this.closeModals();
      alert('Reservación actualizada exitosamente');
      await this.loadPage();
    } else {
      console.log(result);
      alert('Error al actualizar la reservación');
    }
  }

  async createEntity() {
    console.log(`Creando ${this.EntityType} ID:`, this.currentData);

    const result = await reservationsApi.create({
      clientId: this.currentData.clientId,
      roomId: this.currentData.roomId,
      status: this.currentData.status,
      checkInDate: new Date(this.currentData.checkInDate).toISOString(),
      checkOutDate: new Date(this.currentData.checkOutDate).toISOString(),
      charge: this.currentData.charge,
    });

    // @ts-ignore
    if (result.status === 'Success') {
      this.closeModals();
      alert('Reservación creada exitosamente');
      await this.loadPage();
    } else {
      console.log(result);
      alert('Error al crear la reservación');
    }
  }

  async deleteEntity() {
    console.log(`Eliminando ${this.EntityType} ID:`, this.currentData.id);

    const result = await reservationsApi.delete({
      reservationId: this.currentData.id,
    });

    // @ts-ignore
    if (result.status === 'Success') {
      this.closeModals();
      alert('Reservación eliminada exitosamente');
      await this.loadPage();
    } else {
      console.log(result);
      alert('Error al eliminar la reservación');
    }
  }

  async RestoreEntity(reservationId: number) {
    console.log(`Restaurando ${reservationId}`);

    const result = await reservationsApi.restore({
      reservationId: reservationId,
    });
    // @ts-ignore
    if (result.status === 'Success') {
      this.closeModals();
      alert('Reservación restaurada exitosamente');
      await this.loadPage();
    } else {
      console.log(result);
      alert('Error al restaurar la reservación');
    }
  }
}
