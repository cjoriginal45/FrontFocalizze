import { TestBed } from '@angular/core/testing';

import { UserSearch } from '../../interfaces/UserSearch';
import { SearchHistory, SearchHistoryItem } from './search-history';

describe('SearchHistory Service', () => {
  let service: SearchHistory;

  // Almacenamiento temporal en memoria para simular localStorage
  let mockLocalStorage: { [key: string]: string } = {};

  const STORAGE_KEY = 'focalizze_search_history';

  beforeEach(() => {
    // 1. Limpiamos el store antes de cada test
    mockLocalStorage = {};

    // 2. Mockeamos los métodos de localStorage del navegador
    spyOn(localStorage, 'getItem').and.callFake((key) => {
      return mockLocalStorage[key] || null;
    });

    spyOn(localStorage, 'setItem').and.callFake((key, value) => {
      mockLocalStorage[key] = value;
    });

    spyOn(localStorage, 'removeItem').and.callFake((key) => {
      delete mockLocalStorage[key];
    });

    // 3. Configuración del TestBed
    TestBed.configureTestingModule({
      providers: [SearchHistory],
    });

    service = TestBed.inject(SearchHistory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getHistory()', () => {
    it('should return an empty array if localStorage is empty', () => {
      const history = service.getHistory();
      expect(history).toEqual([]);
      expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('should parse and return items stored in localStorage', () => {
      // Arrange
      const mockData: SearchHistoryItem[] = [{ id: 123, type: 'content', query: 'Angular' }];
      mockLocalStorage[STORAGE_KEY] = JSON.stringify(mockData);

      // Act
      const history = service.getHistory();

      // Assert
      expect(history.length).toBe(1);
      expect(history[0]).toEqual(mockData[0]);
    });
  });

  describe('addContentSearch()', () => {
    it('should add a new content search query to the beginning of the list', () => {
      // Act
      service.addContentSearch('Angular 20');

      // Assert
      const history = service.getHistory();
      expect(history.length).toBe(1);
      expect(history[0].type).toBe('content');
      if (history[0].type === 'content') {
        expect(history[0].query).toBe('Angular 20');
      }
    });

    it('should not add empty or whitespace strings', () => {
      service.addContentSearch('');
      service.addContentSearch('   ');

      const history = service.getHistory();
      expect(history.length).toBe(0);
    });

    it('should deduplicate searches (move existing to top)', () => {
      // Arrange
      service.addContentSearch('First');
      service.addContentSearch('Second');

      // Act: Add 'First' again
      service.addContentSearch('First');

      // Assert
      const history = service.getHistory();
      expect(history.length).toBe(2); // No debe haber 3
      // 'First' debe estar en la posición 0 (unshift)
      expect((history[0] as any).query).toBe('First');
      expect((history[1] as any).query).toBe('Second');
    });

    it('should handle case-insensitive deduplication', () => {
      // Arrange
      service.addContentSearch('angular');

      // Act
      service.addContentSearch('ANGULAR');

      // Assert
      const history = service.getHistory();
      expect(history.length).toBe(1);
      expect((history[0] as any).query).toBe('ANGULAR'); // Debe guardar el casing más reciente
    });
  });

  describe('addUserSearch()', () => {
    const mockUser: UserSearch = {
      id: 1,
      username: 'dev_expert',
      avatarUrl: 'img.png',
    } as unknown as UserSearch;

    it('should add a user search to the list', () => {
      // Act
      service.addUserSearch(mockUser);

      // Assert
      const history = service.getHistory();
      expect(history.length).toBe(1);
      expect(history[0].type).toBe('user');
      if (history[0].type === 'user') {
        expect(history[0].user.username).toBe('dev_expert');
      }
    });

    it('should deduplicate user searches based on username', () => {
      // Arrange
      const userB: UserSearch = {
        ...mockUser,
        id: 2,
        username: 'other_dev',
      } as unknown as UserSearch;
      service.addUserSearch(mockUser);
      service.addUserSearch(userB);

      // Act: Add first user again
      service.addUserSearch(mockUser);

      // Assert
      const history = service.getHistory();
      expect(history.length).toBe(2);
      expect((history[0] as any).user.username).toBe('dev_expert'); // Movido al tope
    });

    it('should ignore null/undefined user input', () => {
      service.addUserSearch(null as any);
      expect(service.getHistory().length).toBe(0);
    });
  });

  describe('removeHistoryItem()', () => {
    it('should remove an item by id', () => {
      // Arrange
      service.addContentSearch('To Remove');
      const historyBefore = service.getHistory();
      const idToRemove = historyBefore[0].id;

      // Act
      service.removeHistoryItem(idToRemove);

      // Assert
      const historyAfter = service.getHistory();
      expect(historyAfter.length).toBe(0);
    });

    it('should do nothing if id does not exist', () => {
      // Arrange
      service.addContentSearch('Keep Me');

      // Act
      service.removeHistoryItem(999999); // ID inexistente

      // Assert
      const history = service.getHistory();
      expect(history.length).toBe(1);
    });
  });

  describe('Capacity Limits', () => {
    it('should limit history to MAX_HISTORY_ITEMS (7)', () => {
      // Act: Agregar 10 elementos
      for (let i = 1; i <= 10; i++) {
        service.addContentSearch(`Search ${i}`);
      }

      // Assert
      const history = service.getHistory();
      expect(history.length).toBe(7);
      // El último agregado debe ser el primero en la lista
      expect((history[0] as any).query).toBe('Search 10');
      // El ítem más antiguo ('Search 1', 'Search 2', 'Search 3') debió ser eliminado
      // El último elemento debe ser 'Search 4'
      expect((history[6] as any).query).toBe('Search 4');
    });
  });
});
