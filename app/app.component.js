import {Component} from '@angular/core';
import {CollectionService} from './collection.service';
import {PlaybackService} from './playback.service';
import {AppHeader} from './app-header.component';
import {ArtistList} from './artist-list.component';
import {Album} from './album.component';

@Component({
  selector: 'app',
  templateUrl: 'app/app.component.html',
  directives: [AppHeader, ArtistList, Album],
  providers: [CollectionService, PlaybackService]
})
export class AppComponent {
  constructor(collectionService: CollectionService, playbackService: PlaybackService) {
    this.collectionService = collectionService;
    this.playbackService = playbackService;

/*
    this.collectionService.update().catch(err => {
      console.error(err);
    });
*/
  }

  onAtristSelect(artist) {
    this.collectionService.album(artist).then(tracks => {
      this.playbackService.clean();
      this.playbackService.addTracks(tracks);
      this.playbackService.toggle();
    });
  }
}
