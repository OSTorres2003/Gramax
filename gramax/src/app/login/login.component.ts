import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Importa CommonModule

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule], // Agrega CommonModule aquí
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  dpi: string = '';
  contrasena: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    // Validación básica de campos vacíos
    if (!this.dpi || !this.contrasena) {
      this.errorMessage = 'Por favor, ingrese DPI y contraseña.';
      return;
    }

    this.authService.login(this.dpi, this.contrasena).subscribe(
      (response: any) => {
        console.log('Respuesta del servidor:', response);

        if (response.token && response.rol) {
          this.authService.saveToken(response.token);

          // Guardar DPI en localStorage
          localStorage.setItem('dpi', this.dpi);

          // Redirigir según el rol
          this.redirectUser(response.rol);
        } else {
          this.errorMessage = 'Error en la respuesta del servidor.';
        }
      },
      (error) => {
        console.error('Error en el login:', error);
        this.handleLoginError(error);
      }
    );
  }

  private redirectUser(role: string): void {
    switch (role) {
      case 'administrador':
        this.router.navigate(['/administrador']);
        break;
      case 'cliente':
        this.router.navigate(['/cliente']);
        break;
      default:
        this.errorMessage = 'Rol desconocido. Contacte al soporte técnico.';
    }
  }

  private handleLoginError(error: any): void {
    if (error.status === 404) {
      this.errorMessage = 'DPI no encontrado.';
    } else if (error.status === 401) {
      this.errorMessage = 'Contraseña incorrecta.';
    } else {
      this.errorMessage = 'Error al iniciar sesión. Intente nuevamente.';
    }
  }
}
