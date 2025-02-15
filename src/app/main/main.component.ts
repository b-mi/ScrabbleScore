import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
import { interval, Subscription } from 'rxjs';


export interface Player {
  id: string;
  name: string;
  play: boolean;
  rows: any[];
  score: number;
  seconds: number;
  minutes_seconds: string;
}

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
export class MainComponent implements OnInit, OnDestroy {
  appVersion: string = packageInfo.version;
  private speechService = inject(SpeechService);

  players: Player[] = [];
  currentPlayer!: Player;

  scoreValue: number | undefined = undefined;
  playersCount: number = 0;

  rowIds: number[] = [];
  editMode: boolean = false;
  editIndex: number = 0;
  isEditingPlayers: boolean = false;
  maxScore: number = 0;
  private timeSub!: Subscription;
  bestPlayer: Player | undefined;

  constructor() {
    this.players = [];
    this.addPlayer('p1', 'Hráč 1', true);
    this.addPlayer('p2', 'Hráč 2', true);
    this.addPlayer('p3', 'Hráč 3', false);
    this.addPlayer('p4', 'Hráč 4', false);

    this.currentPlayer = this.players[0];
    this.deserialize();

  }


  startWatch() {
    this.timeSub = interval(1000).subscribe(() => {
      this.currentPlayer.seconds += 1;
      const minutes = Math.floor(this.currentPlayer.seconds / 60);
      const seconds = this.currentPlayer.seconds % 60;
      this.currentPlayer.minutes_seconds = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    });
  }

  addPlayer(id: string, pname: string, play: boolean) {
    let xname = localStorage.getItem(id) ?? pname;
    const p: Player = {
      id: id,
      name: xname,
      play: play,
      rows: [],
      score: 0,
      seconds: 0,
      minutes_seconds: '-'
    };
    this.players.push(p);
  }

  ngOnInit(): void {
    this.getPlayersCount();
    this.findCurrentPlayer();
    this.startWatch();
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
    const oldBestPlayer = this.bestPlayer;
    const oldCurPlayer = this.currentPlayer;
    const oldScore = <number>this.scoreValue;
    if (this.editMode) {
      this.currentPlayer.rows[this.editIndex] = this.scoreValue;
      // this.speech_score(<number>this.scoreValue);
      // this.playSound(<number>this.scoreValue);
      this.sumScore();
      this.editMode = false;
      this.scoreValue = undefined;
      this.findCurrentPlayer();
    } else {
      this.currentPlayer.rows.push(this.scoreValue);
      // this.speech_score(<number>this.scoreValue);

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
    const newBestPlayer = this.bestPlayer;
    let msg = '';
    if (oldBestPlayer?.id === newBestPlayer?.id) {
      msg = `${oldCurPlayer?.name} ${oldScore} ${this.sklonuj_body(oldScore)}`;
    } else {

      const secondBestPlayer = this.players
        .filter(p => p.play && p.score < this.bestPlayer!.score)
        .reduce((a, b) => a.score > b.score ? a : b);
      const diff = this.bestPlayer!.score - secondBestPlayer.score;


      msg = `${oldCurPlayer?.name} ${oldScore} ${this.sklonuj_body(oldScore)} a vyhráva o ${diff} ${this.sklonuj_body(diff)}!`;
    }
    this.speechService.speak(msg);

  }
  sklonuj_body(body: number) {
    switch (body) {
      case 1:
        return 'bod';
      case 2:
      case 3:
      case 4:
        return 'body';
      case 5:

      default:
        return 'bodov';
    }
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
    const activePlayers = this.players.filter(p => p.play);
    const maxIdx = this.rowIds[this.rowIds.length - 1];

    if (maxIdx === undefined) {
      this.currentPlayer = activePlayers[0];
      return;
    }

    this.currentPlayer =
      activePlayers.find(p => (p.rows[maxIdx] ?? -1) === -1) || activePlayers[0];
  }


  sumScore() {
    this.currentPlayer!.score = this.currentPlayer!.rows.reduce((a: number, b: number) => a + b, 0);
    this.calcMaxScore();
  }

  private calcMaxScore() {
    this.maxScore = 0;
    this.players.filter(p => p.play).forEach(p => this.maxScore = Math.max(this.maxScore, p.score));
    const bestPlayers = this.players.filter(p => p.play && p.score == this.maxScore);
    if (bestPlayers.length == 1) {
      this.bestPlayer = bestPlayers[0];
    } else {
      this.bestPlayer = undefined;
    }
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
    this.bestPlayer = undefined;
    this.players.forEach(player => {
      player.rows = [];
      player.score = 0;
      player.seconds = 0;
      player.minutes_seconds = '-'
    });
    this.serialize();
    this.findCurrentPlayer();
  }

  // speech_score(scoreValue: number) {
  //   let text = `${this.currentPlayer!.name} ${scoreValue}`;
  //   if (text.includes('-'))
  //     text = text.replace('-', 'mínus ');
  //   this.speechService.speak(text);
  // }

  ngOnDestroy(): void {
    if (this.timeSub) {
      this.timeSub.unsubscribe();
    }
  }


  info(do_speech: boolean) {
    const secondBestPlayer = this.players
      .filter(p => p.play && p.score < this.bestPlayer!.score)
      .reduce((a, b) => a.score > b.score ? a : b);
    const diff = this.bestPlayer!.score - secondBestPlayer.score;
    const msg = `${this.bestPlayer!.name} vyhráva o ${diff} ${this.sklonuj_body(diff)}!`
    if (do_speech) {
      this.speechService.speak(msg);

    }
  }


}

