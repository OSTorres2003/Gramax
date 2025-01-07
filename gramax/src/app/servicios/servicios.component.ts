import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-servicios',
  standalone: true,
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.css'],
  imports: [CommonModule], // Asegúrate de incluir CommonModule aquí
})
export class ServiciosComponent {
  userData: any = {
    correo_electronico: 'usuario@gramax.com', // Valor por defecto para el saludo
  };

  constructor(private router: Router) {}

  // Método para manejar la navegación a otras rutas
  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }

  // Método para manejar el cierre de sesión
  logout(): void {
    localStorage.clear(); // Limpia localStorage si es necesario
    this.router.navigate(['/login']);
  }
}
