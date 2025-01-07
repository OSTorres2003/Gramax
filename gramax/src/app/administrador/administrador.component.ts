import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { jsPDF } from 'jspdf';
import { Router } from '@angular/router';

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
  passwordCorreo: string = ''; // Nueva propiedad
  passwordSAT: string = ''; // Nueva propiedad
  role: string = 'cliente';
  correoSat: string = '';
  nit: string = '';
  dpi: string = '';
  showNewUserModal: boolean = false;
  userIdToEdit: number | null = null;

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
        user.dpi.toLowerCase().includes(term)
    );
  }

  downloadUserPDF(user: any) {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Detalles del Usuario', 10, 10);

    const data = [
      `Rol: ${user.rol}`,
      `Correo Electrónico: ${user.correo_electronico}`,
      `Contraseña Correo: ${user.contrasena_correo}`,
      `Contraseña SAT: ${user.contrasena_sat}`,
      `Contraseña: ${user.contrasena_original}`,
      `Correo SAT: ${user.correo_sat || 'N/A'}`,
      `NIT: ${user.nit}`,
      `DPI: ${user.dpi}`,
    ];

    data.forEach((line, index) => {
      doc.text(line, 10, 20 + index * 10);
    });

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

    const newUser = {
      correo_electronico: this.email,
      contrasena_correo: this.passwordCorreo,
      contrasena_sat: this.passwordSAT,
      contrasena_original: this.password,
      rol: this.role,
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
