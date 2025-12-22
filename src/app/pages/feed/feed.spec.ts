import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedService } from '../../services/feedService/feed';
import { of } from 'rxjs';
import { Feed } from './feed';

describe('Feed Component', () => {
  let component: Feed;
  let fixture: ComponentFixture<Feed>;
  let feedServiceSpy: jasmine.SpyObj<FeedService>;

  beforeEach(async () => {
    // Creamos el Mock del servicio para que NO pida HttpClient
    feedServiceSpy = jasmine.createSpyObj('FeedService', ['getFeed']);
    
    // Configuramos un retorno por defecto para evitar errores de undefined
    feedServiceSpy.getFeed.and.returnValue(of({ content: [], totalElements: 0 } as any));

    await TestBed.configureTestingModule({
      imports: [Feed], // Componente Standalone
      providers: [
        { provide: FeedService, useValue: feedServiceSpy } // Inyectamos el Mock
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Feed);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});