import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { jsPDF } from 'jspdf'; // Importa jsPDF
import autoTable from 'jspdf-autotable'; // Importa autoTable

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

    // Encabezado con el logo y título
    const logoPath = 'assets/logo.png'; // Ruta del logo
    const img = new Image();
    img.src = logoPath;

    img.onload = () => {
      // Agregar la imagen del logo
      doc.addImage(img, 'PNG', 10, 10, 30, 30);

      // Agregar título
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text('Servicios Gramax', 105, 20, { align: 'center' });
      doc.text('Tel:56266111', 105, 10, { align: 'center' });

      // Línea separadora
      doc.setDrawColor(0, 0, 0);
      doc.line(10, 40, 200, 40);

      // Tabla de datos del cliente
      const data = [
        ['Correo Electrónico', this.userData.correo_electronico || 'N/A'],
        ['Contraseña SAT', this.userData.contrasena_sat || 'N/A'],
        ['DPI', this.userData.dpi || 'N/A'],
        ['Contraseña Correo', this.userData.contrasena_correo || 'N/A'],
        ['Correo SAT', this.userData.correo_sat || 'N/A'],
      ];

      autoTable(doc, {
        head: [['Campo', 'Valor']],
        body: data,
        startY: 50,
        theme: 'grid',
      });

      // Pie de página con el número de página
      const pageCount = doc.internal.pages.length - 1; // Total de páginas generadas
      doc.setFontSize(10);
      doc.text(`Página ${pageCount}`, 105, 290, { align: 'center' });

      // Guardar el PDF
      doc.save('Detalles_Cliente.pdf');
    };

    img.onerror = () => {
      console.error('No se pudo cargar la imagen del logo.');
    };
  }

  // Navegación a diferentes rutas
  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }
}
