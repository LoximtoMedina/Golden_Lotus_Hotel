import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser, faUsers, faBed, faCalendarDays, faLayerGroup, faPowerOff } from '@fortawesome/free-solid-svg-icons';

import { authApi } from '../../features/auth/api';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FontAwesomeModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class Sidebar {
  @Input() name: string = '';
  @Input() role: string = '';
  faSignOut = faPowerOff;
  links = [
    { label: 'Clientes', path: '/clients', icon: faUsers },
    { label: 'Empleados', path: '/employees', icon: faUser },
    { label: 'Reservaciones', path: '/reservations', icon: faCalendarDays },
    { label: 'Habitaciones', path: '/rooms', icon: faBed },
    { label: 'Tipos de habitación', path: '/rooms-types', icon: faLayerGroup },
  ];

  async logout() {
    const result = await authApi.logout();

    // @ts-ignore
    if (result.success) {
      window.location.href = '/login';
    } else {
      console.log(result);
      alert('Error al cerrar sesión');
    }
  }
}
