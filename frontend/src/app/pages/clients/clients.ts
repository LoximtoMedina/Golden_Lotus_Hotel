import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para [(ngModel)]

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.html',
  styleUrl: './clients.css'
})
export class Clients {
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

  saveClient() {
    if (this.isEditing) {
      console.log('Actualizando cliente:', this.currentData);
      // Aquí irá tu código para actualizar en el backend
    } else {
      console.log('Guardando nuevo cliente:', this.currentData);
      // Aquí irá tu código para guardar en el backend
    }
    this.closeModals();
  }

  deleteClient() {
    console.log('Eliminando cliente ID:', this.currentData.id);
    // Aquí irá tu código para eliminar en el backend
    this.closeModals();
  }
}