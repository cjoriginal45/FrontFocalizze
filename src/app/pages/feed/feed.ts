import { Component } from '@angular/core';
import { Suggestions } from '../../components/suggestions/suggestions';
import { BottonNav } from '../../components/botton-nav/botton-nav';

@Component({
  selector: 'app-feed',
  imports: [Suggestions,BottonNav],
  templateUrl: './feed.html',
  styleUrl: './feed.css'
})
export class Feed {
  constructor() { }
}
