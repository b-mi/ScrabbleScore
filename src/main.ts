import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { importProvidersFrom, isDevMode } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(AppComponent, {
    providers: [
        provideAnimations(),
        provideHttpClient(),
        importProvidersFrom(
            ServiceWorkerModule.register('ngsw-worker.js', {
                enabled: !isDevMode(),
                registrationStrategy: 'registerImmediately'
            })
        )
    ]
}).catch(err => console.error(err));
