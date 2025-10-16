import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MenuService } from '../../services/menuService/menu';
import { Menu } from '../menu/menu';
import { Observable } from 'rxjs';
import { Responsive } from '../../services/responsive/responsive';

@Component({
  selector: 'app-header',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    Menu,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  // @ViewChild apunta a MenuComponent
  // @ViewChild points to MenuComponent
  @ViewChild(Menu) public menuComponent!: Menu;

  public isMobile$: Observable<boolean>;

  constructor(private responsiveService: Responsive) {
    this.isMobile$ = this.responsiveService.isMobile$;
  }

  onMenuClick(): void {
    // Llamamos al método toggle() de nuestra referencia a MenuComponent
    // We call the toggle() method of our MenuComponent reference
    this.menuComponent.toggle();
  }
}
