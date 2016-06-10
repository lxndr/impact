import {Component} from '@angular/core';
import {TrackList} from './tracklist';

@Component({
  selector: 'album',
  templateUrl: 'app/album.component.html'
})
export class Album {
  constructor() {
    this.image = null;
    this.title = 'Hybrid Theory';
    this.date = '2011';

    this.discs = [{
      subtitle: 'Explicit',
      tracks: [
        { number: 1, title: 'Papercut' },
        { number: 2, title: 'One Step Closer' },
        { number: 3, title: 'With You' }
      ]
    }, {
      subtitle: 'Implicit',
      tracks: [
        { number: 1, title: 'rcut' },
        { number: 2, title: 'Closer' },
        { number: 3, title: 'You' }
      ]
    }];
  }
}
