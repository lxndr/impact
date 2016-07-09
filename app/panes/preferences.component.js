import {Location} from '@angular/common';
import {Component} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'preferences',
  templateUrl: 'preferences.component.html'
})
export class PreferencesComponent {
  constructor(location: Location) {
    this.location = location;

    this.config = {
      libraryPath: '/home/lxndr/Music'
    };
  }

  submit() {
    // this.config.set();
    this.location.back();
  }
}
