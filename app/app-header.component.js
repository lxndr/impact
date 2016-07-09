import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';
import {PlaybackService} from './playback.service';

@Component({
  moduleId: module.id,
  selector: 'app-header',
  templateUrl: 'app-header.component.html',
  directives: [ROUTER_DIRECTIVES]
})
export class AppHeader {
  track = null;

  constructor(playbackService: PlaybackService) {
    this.playbackService = playbackService;
  }

  ngOnInit() {
    this.trackSubscription = this.playbackService.track$.subscribe(track => {
      this.track = track;
    });

    this.progressSubscription = this.playbackService.progress$.subscribe(progress => {
      console.log(progress);
    });
  }

  ngOnDestroy() {
    this.trackSubscription.unsubscribe();
    this.progressSubscription.unsubscribe();
  }

  onPreviousClicked() {
    this.playbackService.previous();
  }

  onNextClicked() {
    this.playbackService.next();
  }
}
