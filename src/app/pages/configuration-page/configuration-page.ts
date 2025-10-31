import { Component } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatNavList } from '@angular/material/list';
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-configuration-page',
  imports: [MatToolbar, MatIcon, MatNavList, Header],
  templateUrl: './configuration-page.html',
  styleUrl: './configuration-page.css',
})
export class ConfigurationPage {}
