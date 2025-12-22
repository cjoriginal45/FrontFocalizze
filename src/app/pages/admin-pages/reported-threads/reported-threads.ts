import { Component, inject } from '@angular/core';
import { BottonNav } from '../../../components/botton-nav/botton-nav';
import { Header } from '../../../components/header/header';
import { MatIcon } from '@angular/material/icon';
import { ReportResponse } from '../../../interfaces/ReportResponse';
import { MatDialog } from '@angular/material/dialog';
import { ReportDetailsModal } from '../../../components/report-details-modal/report-details-modal/report-details-modal';
import { Admin } from '../../../services/admin/admin';
import { ReportThreadDetailsModal } from '../../../components/report-thread-details-modal/report-thread-details-modal/report-thread-details-modal';
import { TimeAgoPipe } from '../../../pipes/time-ago/time-ago-pipe';

@Component({
  selector: 'app-reported-threads',
  imports: [BottonNav, Header, MatIcon, TimeAgoPipe],
  templateUrl: './reported-threads.html',
  styleUrl: './reported-threads.css',
})
export class ReportedThreads {
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
    this.adminService.getPendingThreadReports(this.currentPage, 20).subscribe({
      next: (page) => {
        this.reports = [...this.reports, ...page.content];
        this.isLastPage = page.last;
        this.currentPage++;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  openReport(report: ReportResponse) {
    const dialogRef = this.dialog.open(ReportThreadDetailsModal, {
      data: report,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        // Si se tomó acción, removemos el reporte de la lista local
        this.reports = this.reports.filter((r) => r.id !== report.id);
      }
    });
  }
}
