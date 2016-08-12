import {Component} from '@angular/core';
import {CollectionService} from './collection.service';
import {PlaybackService} from './playback.service';
import {AppHeader} from './app-header.component';

@Component({
  moduleId: module.id,
  selector: 'app',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  directives: [AppHeader]
})
export class AppComponent {
  constructor(collectionService: CollectionService, playbackService: PlaybackService) {
    this.collectionService = collectionService;
    this.playbackService = playbackService;
  }

  onAtristSelect(artist) {
    this.collectionService.album(artist).then(tracks => {
      this.playbackService.clean();
      this.playbackService.addTracks(tracks);
      this.playbackService.toggle();
    });
  }
}
