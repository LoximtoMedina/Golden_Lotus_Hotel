import { Component, OnInit, signal } from '@angular/core';
import { reservationsApi } from '../../features/reservations/api';
import type { components } from '../../types/api';

import { CommonModule } from '@angular/common'; // Para *ngIf
import { FormsModule } from '@angular/forms';   // Para [(ngModel)]

type reservation = components['schemas']['Reservation'];
type Client = components['schemas']['Client'];
type ListreservationsParams = Parameters<typeof reservationsApi.list>[0];
type PopulatedReservation = reservation & { client: Client }

@Component({
  selector: 'app-reservations',
  imports: [CommonModule, FormsModule],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css',
})


export class reservations implements OnInit {
  reservations = signal<PopulatedReservation[]>([]);
  loading = signal(false);
  error = signal('');
  total = signal(0);
  page = signal(0);
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

  async list(params: ListreservationsParams): Promise<void> {
    this.page.set(params.page);
    this.count.set(params.count);
    this.loading.set(true);
    this.error.set('');

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
  // 1. Variables de control para los Modales
  showFormModal: boolean = false;
  showDeleteModal: boolean = false;
  isEditing: boolean = false;

  // 2. Objeto para el formulario (debe coincidir con tus [(ngModel)])
  currentData: any = {
    id: null,
    name: '',
    status: 'active'
  };

  // 3. Tu lista de reservationes (esto vendrá de tu base de datos luego)
  reservationsList: any[] = [
    { id: 101, name: 'Juan Pérez', status: 'active' },
    { id: 102, name: 'María López', status: 'inactive' }
  ];

  // --- FUNCIONES PARA ABRIR MODALES ---

  openAddModal() {
    this.isEditing = false;
    // Limpiamos el objeto para un nuevo registro
    this.currentData = { id: null, name: '', status: 'active' };
    this.showFormModal = true;
  }

  openEditModal(reservation: any) {
    this.isEditing = true;
    // Usamos el "spread operator" (...) para crear una copia y no editar la tabla directamente
    this.currentData = { ...reservation };
    this.showFormModal = true;
  }

  openDeleteModal(reservation: any) {
    this.currentData = { ...reservation };
    this.showDeleteModal = true;
  }

  closeModals() {
    this.showFormModal = false;
    this.showDeleteModal = false;
  }

  // --- FUNCIONES DE ACCIÓN (Lógica de botones) ---

  saveReservation() {
    if (this.isEditing) {
      console.log('Actualizando reserva:', this.currentData);
      // Aquí irá tu código para actualizar en el backend
    } else {
      console.log('Guardando nueva reserva:', this.currentData);
      // Aquí irá tu código para guardar en el backend
    }
    this.closeModals();
  }

  deleteReservation() {
    console.log('Eliminando reserva ID:', this.currentData.id);
    // Aquí irá tu código para eliminar en el backend
    this.closeModals();
  }
}
