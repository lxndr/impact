import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {HttpModule} from '@angular/http';
import {AppComponent} from './app.component';
import {CollectionService} from './collection.service';
import {PlaybackService} from './playback.service';
import {routing, appRoutingProviders} from './app.routing';
import {LibraryComponent} from './panes/library.component';
import {PreferencesComponent} from './panes/preferences.component';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    routing
  ],
  providers: [
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    CollectionService,
    PlaybackService,
    appRoutingProviders
  ],
  declarations: [
    AppComponent,
    LibraryComponent,
    PreferencesComponent
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {}
