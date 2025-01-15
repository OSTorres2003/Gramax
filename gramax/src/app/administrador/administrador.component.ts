import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Router } from '@angular/router';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './administrador.component.html',
  styleUrls: ['./administrador.component.css'],
})
export class AdministradorComponent implements OnInit {
  email: string = '';
  password: string = '';
  passwordCorreo: string = '';
  passwordSAT: string = '';
  role: string = 'cliente';
  tramite: string = ''; // Campo para el trámite
  correoSat: string = '';
  nit: string = '';
  dpi: string = '';
  showNewUserModal: boolean = false;
  userIdToEdit: number | null = null;

  // Propiedades para mostrar/ocultar contraseñas
  showPassword: boolean = false;
  showPasswordCorreo: boolean = false;
  showPasswordSAT: boolean = false;

  usuarios: any[] = [];
  filteredUsers: any[] = [];
  searchTerm: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.getUsers();
  }

  getUsers() {
    this.http.get<any[]>('http://localhost:3000/users').subscribe(
      (data) => {
        this.usuarios = data;
        this.filteredUsers = data;
      },
      (error) => {
        console.error('Error al obtener usuarios:', error);
      }
    );
  }

  filterUsers() {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.usuarios.filter(
      (user) =>
        user.correo_electronico.toLowerCase().includes(term) ||
        user.nit.toLowerCase().includes(term) ||
        user.dpi.toLowerCase().includes(term) ||
        user.tramite.toLowerCase().includes(term) // Filtro por trámite
    );
  }

  togglePassword(field: string) {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'passwordCorreo') {
      this.showPasswordCorreo = !this.showPasswordCorreo;
    } else if (field === 'passwordSAT') {
      this.showPasswordSAT = !this.showPasswordSAT;
    }
  }

  downloadUserPDF(user: any) {
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = 'assets/logo.png';

    // Agrega el logo
    doc.addImage(logo, 'PNG', 10, 10, 30, 30);

    // Título
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Servicios Gramax', 105, 25, { align: 'center' });
    doc.text('Tel:56266111', 105, 15, { align: 'center' });


    // Línea divisoria
    doc.setLineWidth(0.5);
    doc.line(10, 40, 200, 40);

    // Tabla de datos
    const startY = 50;
    const tableData = [
      ['Rol', user.rol || 'N/A'],
      ['Correo Electrónico', user.correo_electronico || 'N/A'],
      ['Contraseña SAT', user.contrasena_sat || 'N/A'],
      ['DPI', user.dpi || 'N/A'],
      ['Contraseña Correo', user.contrasena_correo || 'N/A'],
      ['Correo SAT', user.correo_sat || 'N/A'],
      ['NIT', user.nit || 'N/A'],
      ['Trámite', user.tramite || 'N/A'],
    ];

    autoTable(doc,{
      startY: startY,
      head: [['Campo', 'Valor']],
      body: tableData,
      styles: {
        halign: 'center',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [0, 153, 102], // Color verde
        textColor: [255, 255, 255], // Color blanco
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 10,
      },
    });

    // Descargar el PDF
    doc.save(`Usuario_${user.dpi}.pdf`);
  }

  openNewUserForm() {
    this.clearForm();
    this.userIdToEdit = null;
    this.showNewUserModal = true;
  }

  closeNewUserForm() {
    this.showNewUserModal = false;
  }

  createUser() {
    if (this.dpi.length !== 13) {
      alert('El DPI debe tener exactamente 13 dígitos.');
      return;
    }

    if (this.tramite === 'agencia virtual' && !this.nit) {
      alert('El NIT es obligatorio para el trámite "Agencia Virtual".');
      return;
    }

    const newUser = {
      correo_electronico: this.email,
      contrasena_correo: this.passwordCorreo,
      contrasena_sat: this.passwordSAT,
      contrasena_original: this.password,
      rol: this.role,
      tramite: this.tramite, // Agregado trámite
      correo_sat: this.correoSat,
      nit: this.nit,
      dpi: this.dpi,
    };

    this.http.post('http://localhost:3000/register', newUser).subscribe(
      () => {
        this.getUsers();
        this.closeNewUserForm();
      },
      (error) => {
        console.error('Error al crear usuario:', error);
      }
    );
  }

  loadUserToEdit(user: any) {
    this.userIdToEdit = user.id;
    this.email = user.correo_electronico;
    this.passwordCorreo = user.contrasena_correo;
    this.passwordSAT = user.contrasena_sat;
    this.role = user.rol;
    this.tramite = user.tramite; // Carga el trámite
    this.correoSat = user.correo_sat;
    this.nit = user.nit;
    this.dpi = user.dpi;
    this.password = user.contrasena_original;
    this.showNewUserModal = true;
  }

  editUser() {
    if (!this.userIdToEdit) return;

    const updatedUser = {
      correo_electronico: this.email,
      contrasena_correo: this.passwordCorreo,
      contrasena_sat: this.passwordSAT,
      contrasena_original: this.password,
      rol: this.role,
      tramite: this.tramite, // Agregado trámite
      correo_sat: this.correoSat,
      nit: this.nit,
      dpi: this.dpi,
    };

    this.http
      .put(`http://localhost:3000/users/${this.userIdToEdit}`, updatedUser)
      .subscribe(() => {
        this.getUsers();
        this.closeNewUserForm();
      });
  }

  deleteUser(id: number) {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.http.delete(`http://localhost:3000/users/${id}`).subscribe(() => {
        this.getUsers();
      });
    }
  }

  clearForm() {
    this.email = '';
    this.password = '';
    this.passwordCorreo = '';
    this.passwordSAT = '';
    this.role = 'cliente';
    this.tramite = ''; // Limpia trámite
    this.correoSat = '';
    this.nit = '';
    this.dpi = '';
    this.userIdToEdit = null;
  }

  logout() {
    this.router.navigate(['/login']);
  }

  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }
}
