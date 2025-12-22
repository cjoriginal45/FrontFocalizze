import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FollowersFollowingModal, FollowersModalData } from './followers-following-modal';
import { ProfileService } from '../../services/profile/profile';
import { UserState } from '../../services/user-state/user-state';
import { Auth } from '../../services/auth/auth';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { FollowButtonService } from '../../services/follow-button/follow-button';
import { CategoryState } from '../../services/category-state/category-state';

describe('FollowersFollowingModal', () => {
  let component: FollowersFollowingModal;
  let fixture: ComponentFixture<FollowersFollowingModal>;
  
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;
  let userStateSpy: jasmine.SpyObj<UserState>;
  let authServiceSpy: jasmine.SpyObj<Auth>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<FollowersFollowingModal>>;
  let followButtonServiceSpy: jasmine.SpyObj<FollowButtonService>;
  let categoryStateSpy: jasmine.SpyObj<CategoryState>;

  // Datos iniciales para la inyección
  const mockData: FollowersModalData = {
    username: 'testuser',
    initialTab: 'followers'
  };

  const mockUsers = [
    { id: 1, username: 'user1', displayName: 'User One', avatarUrl: '', isFollowing: false }
  ];

  beforeEach(async () => {
    profileServiceSpy = jasmine.createSpyObj('ProfileService', ['getFollowers', 'getFollowing']);
    userStateSpy = jasmine.createSpyObj('UserState', ['loadUsers', 'getUserSignal']);
    authServiceSpy = jasmine.createSpyObj('Auth', ['getCurrentUser']);
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    followButtonServiceSpy = jasmine.createSpyObj('FollowButtonService', ['toggleFollow']);
    categoryStateSpy = jasmine.createSpyObj('CategoryState', ['getCategorySignal']);

    profileServiceSpy.getFollowers.and.returnValue(of(mockUsers));
    profileServiceSpy.getFollowing.and.returnValue(of([]));
    authServiceSpy.getCurrentUser.and.returnValue({ username: 'me' } as any);
    
    // El subcomponente FollowButton requiere este signal
    userStateSpy.getUserSignal.and.returnValue(signal({ 
      displayName: 'User One', 
      isFollowing: false 
    } as any));

    await TestBed.configureTestingModule({
      imports: [
        FollowersFollowingModal, 
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        { provide: ProfileService, useValue: profileServiceSpy },
        { provide: UserState, useValue: userStateSpy },
        { provide: Auth, useValue: authServiceSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: FollowButtonService, useValue: followButtonServiceSpy },
        { provide: CategoryState, useValue: categoryStateSpy },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FollowersFollowingModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse y cargar la pestaña inicial de seguidores', () => {
    expect(component).toBeTruthy();
    expect(profileServiceSpy.getFollowers).toHaveBeenCalledWith('testuser');
  });

  it('debería cambiar de pestaña y cargar datos de seguidos', () => {
    component.onTabChange(1);
    expect(component.selectedIndex()).toBe(1);
    expect(profileServiceSpy.getFollowing).toHaveBeenCalledWith('testuser');
  });

  it('debería remover usuario de la lista si dejo de seguir en mi propio perfil', () => {
    // Arrange
    const otherUser = 'other_user';
    
    // Seteamos el estado manualmente para simular que es "Mi Perfil" y estamos en la pestaña "Seguidos"
    // Esto es más limpio que intentar re-inyectar MAT_DIALOG_DATA
    component.isMyProfile.set(true);
    component.selectedIndex.set(1); 
    component.followingList.set([
      { id: 99, username: otherUser, displayName: 'Other', avatarUrl: '', isFollowing: true }
    ]);

    // Act
    component.handleFollowStateChange(otherUser, false);

    // Assert
    expect(component.followingList().length)
      .withContext('El usuario debería haber sido filtrado de la lista de seguidos')
      .toBe(0);
  });

  it('debería cerrar el diálogo al llamar a onClose', () => {
    component.onClose();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });
});