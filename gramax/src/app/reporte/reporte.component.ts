import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Asegúrate de importar esto

Chart.register(...registerables);

@Component({
  selector: 'app-reporte',
  standalone: true,
  templateUrl: './reporte.component.html',
  styleUrls: ['./reporte.component.css'],
  imports: [CommonModule], // Asegúrate de incluir esto
})
export class ReporteComponent implements OnInit {
  nitCount: number = 0;
  agenciaVirtualCount: number = 0;
  weeklyData: any[] = []; // Datos semanales

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchReportData();
  }

  fetchReportData(): void {
    this.http.get('http://localhost:3000/reportes').subscribe(
      (data: any) => {
        this.nitCount = data.nitCount;
        this.agenciaVirtualCount = data.agenciaVirtualCount;
        this.weeklyData = data.weeklyData;
        this.renderCharts();
      },
      (error) => {
        console.error('Error al obtener datos de reportes:', error);
      }
    );
  }

  renderCharts(): void {
    this.renderPieChart();
    this.renderBarChart();
  }

  renderPieChart(): void {
    new Chart('pieChart', {
      type: 'pie',
      data: {
        labels: ['NIT', 'Agencia Virtual'],
        datasets: [
          {
            data: [this.nitCount, this.agenciaVirtualCount],
            backgroundColor: ['#42A5F5', '#FFA726'],
          },
        ],
      },
    });
  }

  renderBarChart(): void {
    const labels = this.weeklyData.map((entry) => entry.week);
    const nitData = this.weeklyData.map((entry) => entry.nit);
    const agenciaData = this.weeklyData.map((entry) => entry.agencia);

    new Chart('barChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'NIT',
            data: nitData,
            backgroundColor: '#42A5F5',
          },
          {
            label: 'Agencia Virtual',
            data: agenciaData,
            backgroundColor: '#FFA726',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      },
    });
  }
}
