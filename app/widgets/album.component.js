import {Component, Input} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'album',
  templateUrl: 'album.component.html'
})
export class Album {
  @Input() album;
  @Input() showTrackList = true;
}
