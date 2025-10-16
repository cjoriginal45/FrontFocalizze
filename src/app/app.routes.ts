import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { B } from '@angular/cdk/keycodes';
import { BottonNav } from './components/botton-nav/botton-nav';
import { Suggestions } from './components/suggestions/suggestions';
import { Feed } from './pages/feed/feed';
import { Header } from './components/header/header';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'register', component: Register },
  { path: 'bottonNav', component: BottonNav },
  { path: 'suggestions', component: Suggestions },
  { path: 'home', component: Feed },
  { path: 'feed', component: Feed },
];
