import { Component, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { Menu } from '../menu/menu';
import { Observable } from 'rxjs';
import { Responsive } from '../../services/responsive/responsive';
import { SearchBar } from '../search-bar/search-bar';

@Component({
  selector: 'app-header',
  imports: [SearchBar, Menu, MatToolbar, MatIcon],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @ViewChild(Menu) public menuComponent!: Menu;
  public isMobile$: Observable<boolean>;

  constructor(private responsiveService: Responsive) {
    this.isMobile$ = this.responsiveService.isMobile$;
  }

  onMenuClick(): void {
    this.menuComponent.toggle();
  }
}
