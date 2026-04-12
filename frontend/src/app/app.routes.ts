import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Clients } from './pages/clients/clients';
import { Employees } from './pages/employees/employees';
import { Rooms } from './pages/rooms/rooms';
import { RoomsTypes } from './pages/rooms-types/rooms-types';
import { reservations } from './pages/reservations/reservations';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'clients', component: Clients },
    { path: 'employees', component: Employees },
    { path: 'reservations', component: reservations },
    { path: 'rooms', component: Rooms },
    { path: 'rooms-types', component: RoomsTypes },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];