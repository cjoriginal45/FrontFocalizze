import { Component } from '@angular/core';
import { Suggestions } from '../../components/suggestions/suggestions';
import { BottonNav } from '../../components/botton-nav/botton-nav';
import { Header } from '../../components/header/header';
<<<<<<< HEAD
import { Menu } from '../../components/menu/menu';

@Component({
  selector: 'app-feed',
  imports: [Suggestions, BottonNav, Header, Menu],
=======
import { CreateThreadButton } from '../../components/create-thread-button/create-thread-button';


@Component({
  selector: 'app-feed',
  imports: [Suggestions, BottonNav, Header,CreateThreadButton],
>>>>>>> d05103b0a58ff2d62ae0ad4507849f0735aad686
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed {
  constructor() {}
}
