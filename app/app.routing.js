import {RouterModule} from '@angular/router';
import {LibraryComponent} from './panes/library.component';
import {PreferencesComponent} from './panes/preferences.component';

const appRoutes = [
  {path: '', redirectTo: '/library', pathMatch: 'full'},
  {path: 'library', name: 'Library', component: LibraryComponent},
  {path: 'preferences', name: 'Preferences', component: PreferencesComponent}
];

export const appRoutingProviders = [

];

export const routing = RouterModule.forRoot(appRoutes);
