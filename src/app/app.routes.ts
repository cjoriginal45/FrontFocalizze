import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { B } from '@angular/cdk/keycodes';
import { BottonNav } from './components/botton-nav/botton-nav';
import { Suggestions } from './components/suggestions/suggestions';
import { Feed } from './pages/feed/feed';
import { Header } from './components/header/header';
import { PasswordRecovery } from './pages/password-recovery/password-recovery';
import { Profile } from './pages/profile/profile/profile';
import { Discover } from './pages/discover/discover';
import { ConfigurationPage } from './pages/configurations/configuration-page/configuration-page';
import { SearchResults } from './pages/search-results/search-results/search-results';
import { SavedThreads } from './pages/saved-threads/saved-threads/saved-threads';
import { SearchMobile } from './pages/search-mobile/search-mobile';
import { Notifications } from './pages/notifications/notifications/notifications';
import { CategoryPage } from './pages/category-page/category-page';
import { authReadyGuard } from './services/guards/auth-ready-guard';
import { CountProfile } from './pages/configurations/count-profile/count-profile/count-profile';
import { NotificationSettings } from './pages/configurations/notification-settings/notification-settings/notification-settings';
import { PrivacyBlocking } from './pages/configurations/privacy-blocking/privacy-blocking/privacy-blocking';
import { LanguageSettings } from './pages/configurations/language-settings/language-settings/language-settings';
import { SecurityAccess } from './pages/configurations/security-access/security-access';
import { FocusMode } from './pages/configurations/focus-mode/focus-mode';
import { ThemePage } from './pages/configurations/theme-page/theme-page';


export const routes: Routes = [
  // ... (rutas públicas como login, register)
  {
    path: '',
    canActivate: [authReadyGuard], // <-- Aplicamos el guardia aquí
    children: [
      // TODAS tus rutas principales (feed, profile, category, etc.) van aquí adentro.
      // Ahora, ninguna de estas rutas se activará hasta que la autenticación esté lista.
      { path: '', component: Login },
      { path: 'login', component: Login },
      { path: 'register', component: Register },
      { path: 'bottonNav', component: BottonNav },
      { path: 'suggestions', component: Suggestions },
      { path: 'home', component: Feed },
      { path: 'search', component: SearchResults },
      { path: 'feed', component: Feed },
      { path: 'profile/:username', component: Profile },
      { path: 'discover', component: Discover },
      { path: 'configuration-page', component: ConfigurationPage },
      { path: 'saved', component: SavedThreads },
      { path: 'search-mobile', component: SearchMobile },
      { path: 'category/:name', component: CategoryPage },
      { path: 'notifications', component: Notifications },
      { path: 'count-profile', component: CountProfile },
      { path: 'notifications-settings', component: NotificationSettings },
      { path: 'privacy-blocking', component: PrivacyBlocking },
      { path: 'language-settings', component: LanguageSettings },
      { path: 'security-access', component: SecurityAccess },
      { path: 'focus-mode', component: FocusMode },
      { path: 'theme', component: ThemePage },
      { path: 'password-recovery', component: PasswordRecovery },
      { path: 'reset-password', component: PasswordRecovery },
    ],
  },
];
