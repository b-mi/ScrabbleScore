import { Component, inject, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import packageInfo from '../../../package.json';
import { MatCard, MatCardContent } from '@angular/material/card';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFabButton, MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatDivider } from '@angular/material/divider';
import { MatCheckbox } from '@angular/material/checkbox';
import { SpeechService } from '../speech.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  standalone: true,
  imports: [MatCard, MatCardContent, CdkDropList, NgFor, NgIf, CdkDrag,
    MatChipsModule, NgClass, MatFormField, MatLabel, MatInput,
    ReactiveFormsModule, FormsModule, MatFabButton, MatIcon, MatButton,
    MatIconButton, MatMenuTrigger, MatMenu, MatMenuItem, MatDivider,
    MatCheckbox]
})
export class MainComponent implements OnInit {
  appVersion: string = packageInfo.version;
  private speechService = inject(SpeechService);

  players: any[] = [];
  currentPlayer: any;

  scoreValue: number | undefined = undefined;
  playersCount: number = 0;

  rowIds: number[] = [];
  editMode: boolean = false;
  editIndex: number = 0;
  isEditingPlayers: boolean = false;
  maxScore: number = 0;

  constructor() {
    this.players = [];
    this.addPlayer('p1', 'Hráč 1', true);
    this.addPlayer('p2', 'Hráč 2', true);
    this.addPlayer('p3', 'Hráč 3', false);
    this.addPlayer('p4', 'Hráč 4', false);

    this.currentPlayer = this.players[0];
    this.deserialize();

  }
  addPlayer(id: string, pname: string, play: boolean) {
    let xname = localStorage.getItem(id) ?? pname;
    const data = { id: id, name: xname, play: play, rows: [], score: 0 };
    this.players.push(data);
  }

  ngOnInit(): void {
    this.getPlayersCount();
    this.findCurrentPlayer();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.players, event.previousIndex, event.currentIndex);
    this.findCurrentPlayer();
  }


  playerClick(player: any) {

    // player.play = player.play === true ? false : true;
    this.getPlayersCount();
  }

  keyClick(key: string) {

    let val: number = this.scoreValue ?? 0;
    let sval: string = String(val);
    let newVal: number = val;
    switch (key) {
      case '-':
        newVal = -val;
        break;
      case 'BS':
        if (sval.length) {
          sval = sval.substring(0, sval.length - 1);
          if (sval === '-')
            newVal = 0;
          else
            newVal = Number(sval);
        }
        break;

      default:
        newVal = Number(sval + key);
        break;
    }
    this.scoreValue = newVal;
    // this.playPressSnd();
  }

  addScore() {
    if (this.editMode) {
      this.currentPlayer.rows[this.editIndex] = this.scoreValue;
      this.speech(<number>this.scoreValue);
      // this.playSound(<number>this.scoreValue);
      this.sumScore();
      this.editMode = false;
      this.scoreValue = undefined;
      this.findCurrentPlayer();
    } else {
      this.currentPlayer.rows.push(this.scoreValue);
      this.speech(<number>this.scoreValue);
      // this.playSound(<number>this.scoreValue);

      if (this.currentPlayer.rows.length > this.rowIds.length) {
        this.rowIds.push(this.rowIds.length);

        setTimeout(() => {

          const objDiv = <any>document.getElementById("scrlst");
          objDiv.scrollTop = objDiv.scrollHeight;
        });

      }
      this.scoreValue = undefined;
      this.sumScore();
      this.findCurrentPlayer();
    }
    this.serialize();
  }
  serialize() {
    localStorage.setItem('scrb', JSON.stringify(this.players))
    localStorage.setItem('scrbr', JSON.stringify(this.rowIds))
  }

  deserialize() {
    const scrb = localStorage.getItem('scrb'); // players
    const scrbr = localStorage.getItem('scrbr'); // score
    if (scrb) {
      this.players = JSON.parse(scrb);
    }
    if (scrbr) {
      this.rowIds = JSON.parse(scrbr);
      this.calcMaxScore();
    }
  }


  findCurrentPlayer() {
    const plyrs = this.players.filter(i => i.play === true);
    let maxIdx = this.rowIds[this.rowIds.length - 1];

    if (maxIdx === undefined) {
      this.currentPlayer = plyrs[0];
      return;
    }

    this.currentPlayer = null;
    for (let index = 0; index < plyrs.length; index++) {
      if ((plyrs[index].rows[maxIdx] ?? -1) === -1)
        this.currentPlayer = plyrs[index];
    }

    if (!this.currentPlayer)
      this.currentPlayer = plyrs[0];

  }
  sumScore() {
    this.currentPlayer.score = this.currentPlayer.rows.reduce((a: number, b: number) => a + b, 0);
    this.calcMaxScore();
  }

  private calcMaxScore() {
    this.maxScore = 0;
    this.players.filter(p => p.play).forEach(p => this.maxScore = Math.max(this.maxScore, p.score));
  }

  getPlayersCount() {
    this.playersCount = this.players.filter(i => i.play === true).length;
  }


  editScore(player: any, index: number) {
    this.editMode = true;
    this.currentPlayer = player;
    this.editIndex = index;
    this.scoreValue = <number>player.rows[index];
  }

  renamePlayers() {
    this.isEditingPlayers = true;
  }

  savePlayerName() {
    this.players.forEach(player => {
      localStorage.setItem(player.id, player.name);
    });
    this.isEditingPlayers = false;
  }

  reset() {
    this.rowIds = [];
    this.maxScore = 0;
    this.players.forEach(player => {
      player.rows = [];
      player.score = 0;
    });
    this.serialize();
    this.findCurrentPlayer();
  }

  // playSound(points: number) {

  //   const audioContext = new AudioContext();

  //   const oscillator = audioContext.createOscillator();
  //   const gainNode = audioContext.createGain();
  //   oscillator.connect(gainNode); //.connect(merger, 0, 0);
  //   gainNode.connect(audioContext.destination);

  //   gainNode.gain.value = 0.2;
  //   oscillator.frequency.value = 40 + points * 50;
  //   oscillator.type = 'sawtooth';
  //   oscillator.start(0);

  //   oscillator.stop(0.2);

  // }

  // playPressSnd() {
  //   const audioContext = new AudioContext();

  //   const oscillator = audioContext.createOscillator();
  //   const gainNode = audioContext.createGain();
  //   oscillator.connect(gainNode); //.connect(merger, 0, 0);
  //   gainNode.connect(audioContext.destination);

  //   gainNode.gain.value = 0.2;
  //   oscillator.frequency.value = 2000;
  //   oscillator.type = 'square';
  //   oscillator.start(0);

  //   oscillator.stop(0.01);
  // }

  speech(scoreValue: number) {
    let text = `${this.currentPlayer.name} ${scoreValue}`;
    if(text.includes('-'))
      text = text.replace('-', 'mínus ');
    this.speechService.speak(text);
  }



}
