import { Routes } from '@angular/router';
import { Clients } from './pages/clients/clients';
import { Employees } from './pages/employees/employees';
import { reservations } from './pages/reservations/reservations';
import { Rooms } from './pages/rooms/rooms';
import { RoomsTypes } from './pages/rooms-types/rooms-types';


export const routes: Routes = [
    { path: 'clients', component: Clients },
    { path: 'employees', component: Employees },
    { path: 'reservations', component: reservations },
    { path: 'rooms', component: Rooms },
    { path: 'rooms-types', component: RoomsTypes },
    { path: '', redirectTo: '/clients', pathMatch: 'full' }
];
