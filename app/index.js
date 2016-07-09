import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import {provideRouter} from '@angular/router';
import {disableDeprecatedForms, provideForms} from '@angular/forms';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {AppComponent} from './app.component';
import {LibraryComponent} from './panes/library.component';
import {PreferencesComponent} from './panes/preferences.component';

const routes = [
  {path: '', redirectTo: '/library', pathMatch: 'full'},
  {path: 'library', name: 'Library', component: LibraryComponent},
  {path: 'preferences', name: 'Preferences', component: PreferencesComponent}
];

bootstrap(AppComponent, [
  disableDeprecatedForms(),
  provideForms(),
  {provide: LocationStrategy, useClass: HashLocationStrategy},
  provideRouter(routes)
]);
