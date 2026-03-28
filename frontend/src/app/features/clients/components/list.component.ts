import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../services/client.service';
import { Client } from '../models/client.types';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list.component.html',
})
export class ClientComponent implements OnInit {
  private clientService = inject(ClientService);
  clients: Client[] = [];

  ngOnInit() {
    this.clientService.list({ count: 10, page: 0 }).subscribe({
      next: (res) => (this.clients = res.data as any),
      error: (err) => console.error(err),
    });
  }
}
