import { Component } from '@angular/core';
import { Suggestions } from '../../components/suggestions/suggestions';
import { BottonNav } from '../../components/botton-nav/botton-nav';
import { Header } from '../../components/header/header';
import { CreateThreadButton } from '../../components/create-thread-button/create-thread-button';
import { FollowingDiscovering } from '../../components/following-discovering/following-discovering';
import { Thread, ThreadDto } from '../../components/thread/thread';

@Component({
  selector: 'app-feed',
  imports: [
    Suggestions, 
    BottonNav, 
    Header, 
    CreateThreadButton, 
    FollowingDiscovering,
    Thread
  ],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed {
  constructor() {}

     // Datos de ejemplo que eventualmente vendrán de una API
  // Mock data that will eventually come from an API
  threads: ThreadDto[] = [
    {
      id: 1,
      user: { name: 'Joaquín C.', username: 'cjoriginal', avatarUrl: 'public\assets\images\gamer.png' },
      publicationDate: new Date(),
      posts: [
        'Este es el primer post de un hilo muy interesante sobre el desarrollo con Angular y Spring Boot. La idea es mostrar solo este primer post en la vista de feed para no saturar la pantalla con demasiada información y mantener un diseño limpio y minimalista.',
        'En el segundo post, podríamos hablar de...'
      ],
      stats: { likes: 125, comments: 14, views: 2400 },
      isLiked: false,
      isSaved: false
    },
    {
      id: 2,
      user: { name: 'Ana García', username: 'anagarcia', avatarUrl: 'public\assets\images\woman.png' },
      publicationDate: new Date(Date.now() - 86400000), // Ayer
      posts: [
        '¡Acabo de descubrir una nueva librería de CSS que es increíble! Se llama "Open Props" y facilita mucho el diseño responsive sin necesidad de escribir media queries complejas para todo. Totalmente recomendada.'
      ],
      stats: { likes: 342, comments: 28, views: 5600 },
      isLiked: true,
      isSaved: false
    },
    {
      id: 3,
      user: { name: 'Pedro Diaz', username: 'pedroDiaz', avatarUrl: 'public\assets\images\woman.png' },
      publicationDate: new Date(Date.now()),
      posts: [
        '¡Acabo de descubrir una nueva librería de CSS que es increíble! Se llama "Open Props" y facilita mucho el diseño responsive sin necesidad de escribir media queries complejas para todo. Totalmente recomendada.'
      ],
      stats: { likes: 223, comments: 12, views: 1000 },
      isLiked: true,
      isSaved: false
    }

  ];
}
