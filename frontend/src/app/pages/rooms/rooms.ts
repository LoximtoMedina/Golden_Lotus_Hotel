// Librerías y tipos importados
import { Component, OnInit, signal } from '@angular/core'; // Componentes y señales de Angular
import { CommonModule } from '@angular/common'; // Para *ngIf
import { FormsModule } from '@angular/forms';   // Para [(ngModel)]
import type { components } from '../../types/api'; // Tipos generados a partir de la API
import { SharedComponent } from '../../components/shared-layout/shared'; // Importa el componente compartido

@Component({
  selector: 'app-rooms',
  imports: [CommonModule, FormsModule, SharedComponent],
  templateUrl: './rooms.html',
  styleUrls: ['./rooms.css'],
})

export class Rooms {
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
