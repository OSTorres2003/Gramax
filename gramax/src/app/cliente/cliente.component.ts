import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { jsPDF } from 'jspdf'; // Importa jsPDF

@Component({
  selector: 'app-cliente',
  standalone: true,
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css'],
  imports: [CommonModule],
})
export class ClienteComponent implements OnInit {
  userData: any = null;
  loading: boolean = true;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const dpi = localStorage.getItem('dpi'); // Obtén el DPI del cliente desde localStorage
    if (!dpi) {
      this.router.navigate(['/login']); // Redirige al login si no hay DPI
      return;
    }
    this.loadClientData(dpi);
  }

  loadClientData(dpi: string): void {
    this.http.get(`http://localhost:3000/user/${dpi}`).subscribe(
      (data: any) => {
        this.userData = data; // Almacena los datos obtenidos
        this.loading = false; // Marca que ya terminó de cargar
      },
      (error) => {
        console.error('Error al cargar datos del cliente:', error);
        this.loading = false;
        this.router.navigate(['/login']); // Redirige al login en caso de error
      }
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Generar PDF con los datos del cliente
  generatePDF(): void {
    if (!this.userData) {
      console.error('No hay datos disponibles para generar el PDF.');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Detalles del Cliente', 10, 10);

    const yStart = 20; // Coordenada Y inicial
    const lineHeight = 10; // Altura entre líneas
    let currentY = yStart;

    // Datos del cliente
    const data = [
      `Correo Electrónico: ${this.userData.correo_electronico || 'N/A'}`,
      `Contraseña Correo: ${this.userData.contrasena_original || 'N/A'}`,
      `Correo SAT: ${this.userData.correo_sat || 'N/A'}`,
      `DPI: ${this.userData.dpi || 'N/A'}`,
      `Contraseña SAT: ${this.userData.contrasena_sat || 'N/A'}`,
    ];

    data.forEach((line) => {
      doc.text(line, 10, currentY);
      currentY += lineHeight; // Incrementa la posición Y
    });

    // Descargar el PDF
    doc.save('Detalles_Cliente.pdf');
  }

  // Navegación a diferentes rutas
  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }
}
