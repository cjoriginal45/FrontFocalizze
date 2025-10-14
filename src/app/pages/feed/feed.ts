import { Component } from '@angular/core';
import { Suggestions } from '../../components/suggestions/suggestions';
import { BottonNav } from '../../components/botton-nav/botton-nav';
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-feed',
  imports: [Suggestions, BottonNav, Header],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed {
  constructor() {}
}
