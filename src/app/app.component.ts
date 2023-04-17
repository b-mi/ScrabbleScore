import { Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

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

    console.log('swUpdate', this.swUpdate.isEnabled, this.swUpdate.versionUpdates, this.swUpdate);

    if (this.swUpdate.isEnabled) {

      this.swUpdate.versionUpdates.subscribe(() => {

        if (confirm("New version available. Load New Version?")) {

          window.location.reload();
        }
      });
    }
  }
}
