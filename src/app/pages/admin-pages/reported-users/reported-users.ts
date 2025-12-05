import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { BottonNav } from '../../../components/botton-nav/botton-nav';
import { Header } from '../../../components/header/header';
import { TimeAgoPipe } from '../../../pipes/time-ago/time-ago-pipe';
import { MatDialog } from '@angular/material/dialog';
import { ReportDetailsModal } from '../../../components/report-details-modal/report-details-modal/report-details-modal';
import { ReportResponse } from '../../../interfaces/ReportResponse';
import { Admin } from '../../../services/admin/admin';

@Component({
  selector: 'app-reported-users',
  standalone : true,
  imports: [CommonModule, Header, BottonNav, MatIconModule, TimeAgoPipe],
  templateUrl: './reported-users.html',
  styleUrl: './reported-users.css',
})
export class ReportedUsers {
  private adminService = inject(Admin);
  private dialog = inject(MatDialog);

  reports: ReportResponse[] = [];
  isLoading = false;
  currentPage = 0;
  isLastPage = false;

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    if (this.isLoading) return;
    this.isLoading = true;
    this.adminService.getPendingReports(this.currentPage, 20).subscribe({
      next: (page) => {
        this.reports = [...this.reports, ...page.content];
        this.isLastPage = page.last;
        this.currentPage++;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  openReport(report: ReportResponse) {
    const dialogRef = this.dialog.open(ReportDetailsModal, {
      width: '500px',
      data: report
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        // Si se tomó acción, removemos el reporte de la lista local
        this.reports = this.reports.filter(r => r.id !== report.id);
      }
    });
  }
}
