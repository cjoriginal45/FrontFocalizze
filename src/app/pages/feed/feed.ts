import { Component, inject } from '@angular/core';
import { Suggestions } from '../../components/suggestions/suggestions';
import { BottonNav } from '../../components/botton-nav/botton-nav';
import { Header } from '../../components/header/header';
import { CreateThreadButton } from '../../components/create-thread-button/create-thread-button';
import { FollowingDiscovering } from '../../components/following-discovering/following-discovering';
import { Thread, ThreadDto } from '../../components/thread/thread';
import { MatDialog } from '@angular/material/dialog';
import { Comments } from '../../components/comments/comments';

@Component({
  selector: 'app-feed',
  imports: [Suggestions, BottonNav, Header, CreateThreadButton, FollowingDiscovering, Thread],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed {
  constructor() {}

  public dialog = inject(MatDialog);

  // Datos de ejemplo que eventualmente vendrán de una API
  // Mock data that will eventually come from an API
  threads: ThreadDto[] = [
    {
      id: 1,
      user: {
        name: 'Joaquín C.',
        username: 'cjoriginal',
        avatarUrl: 'publicassetsimagesgamer.png',
      },
      publicationDate: new Date(),
      posts: [
        'Este es el primer post de un hilo muy interesante sobre el desarrollo con Angular y Spring Boot. La idea es mostrar solo este primer post en la vista de feed para no saturar la pantalla con demasiada información y mantener un diseño limpio y minimalista.',
        'En el segundo post, podríamos hablar de cómo estructurar los componentes de manera eficiente. La separación de responsabilidades es clave para un proyecto mantenible a largo plazo. ¿Usan componentes "smart" y "dumb"?',
        'Y finalmente, en el tercer post, podemos tocar el tema de la autenticación con JWT, conectando nuestro frontend de Angular con el backend de Spring Security. Es un flujo crucial en casi cualquier aplicación moderna.',
      ],
      stats: { likes: 125, comments: 14, views: 2400 },
      isLiked: false,
      isSaved: false,
    },
    {
      id: 2,
      user: { name: 'Ana García', username: 'anagarcia', avatarUrl: 'publicassetsimageswoman.png' },
      publicationDate: new Date(Date.now() - 86400000), // Ayer
      posts: [
        'Este es el primer post de un hilo muy interesante sobre el desarrollo con Angular y Spring Boot. La idea es mostrar solo este primer post en la vista de feed para no saturar la pantalla con demasiada información y mantener un diseño limpio y minimalista.',
        'En el segundo post, podríamos hablar de cómo estructurar los componentes de manera eficiente. La separación de responsabilidades es clave para un proyecto mantenible a largo plazo. ¿Usan componentes "smart" y "dumb"?',
        'Y finalmente, en el tercer post, podemos tocar el tema de la autenticación con JWT, conectando nuestro frontend de Angular con el backend de Spring Security. Es un flujo crucial en casi cualquier aplicación moderna.',
      ],
      stats: { likes: 342, comments: 28, views: 5600 },
      isLiked: true,
      isSaved: false,
    },
    {
      id: 3,
      user: { name: 'Pedro Diaz', username: 'pedroDiaz', avatarUrl: 'publicassetsimageswoman.png' },
      publicationDate: new Date(Date.now()),
      posts: [
        'Este es el primer post de un hilo muy interesante sobre el desarrollo con Angular y Spring Boot. La idea es mostrar solo este primer post en la vista de feed para no saturar la pantalla con demasiada información y mantener un diseño limpio y minimalista.',
        'En el segundo post, podríamos hablar de cómo estructurar los componentes de manera eficiente. La separación de responsabilidades es clave para un proyecto mantenible a largo plazo. ¿Usan componentes "smart" y "dumb"?',
        'Y finalmente, en el tercer post, podemos tocar el tema de la autenticación con JWT, conectando nuestro frontend de Angular con el backend de Spring Security. Es un flujo crucial en casi cualquier aplicación moderna.',
      ],
      stats: { likes: 223, comments: 12, views: 1000 },
      isLiked: true,
      isSaved: false,
    },
  ];

  openCommentsModal(postId: number): void {
    this.dialog.open(Comments, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        postId: postId,
      },
      panelClass: 'comments-dialog-container',
    });
  }
}
