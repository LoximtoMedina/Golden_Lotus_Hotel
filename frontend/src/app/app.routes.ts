import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Clients } from './pages/clients/clients';
import { Employees } from './pages/employees/employees';
import { Rooms } from './pages/rooms/rooms';
import { RoomTypes } from './pages/room-types/room-types';
import { reservations } from './pages/reservations/reservations';
import { AuthenticatedLayout } from './layouts/authenticated-layout/authenticated-layout';

export const routes: Routes = [
  { path: '',
    component: AuthenticatedLayout,
    children: [
      { path: 'clients', component: Clients, title: 'Golden Lotus Hotel | Clients' },
      { path: 'employees', component: Employees, title: 'Golden Lotus Hotel | Employees' },
      { path: 'reservations', component: reservations, title: 'Golden Lotus Hotel | Reservations' },
      { path: 'rooms', component: Rooms, title: 'Golden Lotus Hotel | Rooms' },
      { path: 'rooms-types', component: RoomTypes, title: 'Golden Lotus Hotel | Room Types' },
      { path: '', redirectTo: '/login', pathMatch: 'full' },
    ]
  },
  { path: 'login', component: Login, title: 'Golden Lotus Hotel | Login'  },
];
