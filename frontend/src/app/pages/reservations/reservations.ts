// Librerías y tipos importados
import { Component, OnInit, signal } from '@angular/core'; // Componentes y señales de Angular
import { CommonModule } from '@angular/common'; // Para *ngIf
import { FormsModule } from '@angular/forms';   // Para [(ngModel)]
import { reservationsApi } from '../../features/reservations/api'; // API para reservas
import type { components } from '../../types/api'; // Tipos generados a partir de la API
import { SharedComponent } from '../../components/shared-layout/shared'; // Importa el componente compartido

// Tipos para reservas, clientes y parámetros de listado
type reservation = components['schemas']['Reservation'];
type Client = components['schemas']['Client'];
type ListreservationsParams = Parameters<typeof reservationsApi.list>[0];
type PopulatedReservation = reservation & { client: Client }

// Componente principal para la gestión de empleados
@Component({
  selector: 'app-reservations',
  imports: [CommonModule, FormsModule, SharedComponent],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css',
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
    status: 'active'
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
      creationDate: new Date().toISOString()
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
