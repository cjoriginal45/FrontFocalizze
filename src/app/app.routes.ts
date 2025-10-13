import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { B } from '@angular/cdk/keycodes';
import { BottonNav } from './components/botton-nav/botton-nav';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'register', component: Register },
  {path: 'bottonNav', component: BottonNav }
];
