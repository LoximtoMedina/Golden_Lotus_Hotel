// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'clients',
    loadComponent: () =>
      import('./features/clients/components/list.component').then((m) => m.ClientComponent),
  },
  {
    path: '',
    redirectTo: 'clients',
    pathMatch: 'full',
  },
];
