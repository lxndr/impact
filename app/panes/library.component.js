import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {ArtistList} from './artist-list.component';
import {CollectionService} from '../collection.service';

@Component({
  moduleId: module.id,
  selector: 'library',
  templateUrl: 'library.component.html',
  directives: [ROUTER_DIRECTIVES, ArtistList]
})
export class LibraryComponent {
  constructor(collection: CollectionService) {
    this.collection = collection;
  }
}
