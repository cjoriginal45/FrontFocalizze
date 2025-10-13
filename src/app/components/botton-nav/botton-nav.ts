import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-botton-nav',
  imports: [  MatIconModule, RouterLink,RouterLinkActive ],
  templateUrl: './botton-nav.html',
  styleUrl: './botton-nav.css'
})
export class BottonNav {
  constructor() {}
}
