import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdministradorComponent } from './administrador/administrador.component';
import { ClienteComponent } from './cliente/cliente.component';
import { ServiciosComponent } from './servicios/servicios.component';
import { ReporteComponent } from './reporte/reporte.component';
import { MantenimientoComponent } from './mantenimiento/mantenimiento.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'cliente', component: ClienteComponent },
  { path: 'administrador', component: AdministradorComponent },
  { path: 'servicios', component: ServiciosComponent },
  { path: 'reporte', component: ReporteComponent }, // Nueva ruta para Reporte
  { path: 'mantenimiento', component: MantenimientoComponent }, // Nueva ruta para Mantenimiento
  { path: '**', redirectTo: '/login' }, // Redirige al login si la ruta no existe
];
