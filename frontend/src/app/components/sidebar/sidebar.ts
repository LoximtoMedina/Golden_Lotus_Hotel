import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { authApi } from '../../features/auth/api';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class Sidebar {
  @Input() name: string = '';
  @Input() role: string = '';

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
