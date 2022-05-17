import { Routes } from '@angular/router';
import { AuthGuard, LoggedInGuard, LoginGuard } from 'core';
import { NotFoundComponent } from './main/not-found/not-found.component';

export const AppRoute: Routes = [
  { path: '', loadChildren: () => import('./main/main.module').then(m => m.MainModule), canActivate: [AuthGuard], data: { preload: true, delay: true } },
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule), canActivate: [LoggedInGuard], data: { preload: true, delay: true } },
  { path: 'choose-facility', loadChildren: () => import('./choose-facility/choose-facility.module').then(m => m.ChooseFacilityModule), canActivate: [LoginGuard] },
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo:'security/not-found', pathMatch:'full'}
];
