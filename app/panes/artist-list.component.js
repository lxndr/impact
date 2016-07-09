import {Component, Input, Output, EventEmitter} from '@angular/core';
import {CollectionService} from '../collection.service';

@Component({
  moduleId: module.id,
  selector: 'artist-list',
  templateUrl: 'artist-list.component.html',
  providers: [CollectionService]
})
export class ArtistList {
  @Input() artists = [];
  @Output() select = new EventEmitter();
}
