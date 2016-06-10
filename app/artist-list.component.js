import {Component, Output, EventEmitter} from '@angular/core';
import {CollectionService} from './collection.service';

@Component({
  selector: 'artist-list',
  templateUrl: 'app/artist-list.component.html',
  providers: [CollectionService]
})
export class ArtistList {
  artists = [];
  @Output() select = new EventEmitter();

  constructor(collectionService: CollectionService) {
    this.collectionService = collectionService;
  }

  ngOnInit() {
    this.artists = global.Promise.resolve(this.collectionService.albums());
  }
}
