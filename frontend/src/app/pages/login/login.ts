import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Importa el Router

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html'
})
export class Login {
  credentials = {
    email: '',
    password: ''
  };

  constructor(private router: Router) {} // Inyecta el Router aquí

  onLogin() {
    // Redirección directa sin validación
    this.router.navigate(['/reservations']);
  }
}