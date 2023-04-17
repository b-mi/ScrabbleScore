import { Component } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, map } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ScrabbleScore';

  constructor(private swUpdate: SwUpdate) {
  }

  ngOnInit() {

    console.log('swUpdate20', this.swUpdate.isEnabled, this.swUpdate.versionUpdates, this.swUpdate, this.swUpdate.checkForUpdate());

    if (this.swUpdate.isEnabled) {

      // const updatesAvailable = this.swUpdate.versionUpdates.pipe(
      //   filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
      //   map(evt => ({
      //     type: 'UPDATE_AVAILABLE',
      //     current: evt.currentVersion,
      //     available: evt.latestVersion,
      //   })));


      this.swUpdate.versionUpdates.subscribe(() => {

        if (confirm("New version available. Load New Version?")) {
          this.swUpdate.activateUpdate();
          window.location.reload();
        }
      });
    }
  }
}
