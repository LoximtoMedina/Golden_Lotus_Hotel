import { Component, OnInit, signal } from '@angular/core';
import { clientsApi } from '../../features/clients/api';
import type { components } from '../../types/api';

import { CommonModule } from '@angular/common'; // Para *ngIf
import { FormsModule } from '@angular/forms';   // Para [(ngModel)]

type client = components['schemas']['Client'];
type ListclientsParams = Parameters<typeof clientsApi.list>[0];

@Component({
  selector: 'app-client',
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})
export class Clients implements OnInit {
  clients = signal<client[]>([]);
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

  async list(params: ListclientsParams): Promise<void> {
    this.page.set(params.page);
    this.count.set(params.count);
    this.loading.set(true);
    this.error.set('');

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

  // TEMPORAL
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

  // 3. Tu lista de clientes (esto vendrá de tu base de datos luego)
  clientsList: any[] = [
    { id: 101, name: 'Juan Pérez', status: 'active' },
    { id: 102, name: 'María López', status: 'inactive' }
  ];

  // --- FUNCIONES PARA ABRIR MODALES ---

  openAddModal() {
    this.isEditing = false;
   this.currentData = {
      id: null,
      identityNumber: '',
      phone: '',
      salary: 0,
      name: '',
      email: '',
      accessKey: '',
      role: '',
      active: true
    };
    this.showFormModal = true;
  }

  openEditModal(client: any) {
    this.isEditing = true;
    // Usamos el "spread operator" (...) para crear una copia y no editar la tabla directamente
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

  // --- FUNCIONES DE ACCIÓN (Lógica de botones) ---

  saveclient() {
    if (this.isEditing) {
      console.log('Actualizando cliente:', this.currentData);
      // Aquí irá tu código para actualizar en el backend
    } else {
      console.log('Guardando nuevo cliente:', this.currentData);
      // Aquí irá tu código para guardar en el backend
    }
    this.closeModals();
  }

  deleteclient() {
    console.log('Eliminando cliente ID:', this.currentData.id);
    // Aquí irá tu código para eliminar en el backend
    this.closeModals();
  }
}
