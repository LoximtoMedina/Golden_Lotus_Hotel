// Librerías y tipos importados
import { Component, OnInit, signal } from '@angular/core'; // Componentes y señales de Angular
import { CommonModule } from '@angular/common'; // Para *ngIf
import { FormsModule } from '@angular/forms';   // Para [(ngModel)]
import type { components } from '../../types/api'; // Tipos generados a partir de la API
import { SharedComponent } from '../../components/shared-layout/shared'; // Importa el componente compartido

@Component({
  selector: 'app-rooms',
  imports: [],
  templateUrl: './rooms.html',
  styleUrl: './rooms.css',
})
export class Rooms {}
