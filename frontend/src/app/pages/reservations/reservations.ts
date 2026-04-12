import { Component } from '@angular/core';

import { CommonModule } from '@angular/common'; // Para *ngIf
import { FormsModule } from '@angular/forms';   // Para [(ngModel)]

@Component({
  selector: 'app-reservations',
  imports: [CommonModule, FormsModule],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css',
})

export class Reservations {
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
    // Limpiamos el objeto para un nuevo registro
    this.currentData = { id: null, name: '', status: 'active' };
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
