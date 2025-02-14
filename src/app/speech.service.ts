import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpeechService {

  constructor() { }

  speak(text: string): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'sk-SK';
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('Speech Synthesis API nie je podporované.');
    }
  }
}
