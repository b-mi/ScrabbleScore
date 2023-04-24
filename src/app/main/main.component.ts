import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import packageInfo from '../../../package.json';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  appVersion: string = packageInfo.version;

  players: any[] = [];
  currentPlayer: any;

  scoreValue: number | undefined = undefined;
  playersCount: number = 0;

  rowIds: number[] = [];
  editMode: boolean = false;
  editIndex: number = 0;
  isEditingPlayers: boolean = false;

  constructor() {
    this.players = [];
    this.addPlayer('p1', 'Hráč 1', true);
    this.addPlayer('p2', 'Hráč 2', true);
    this.addPlayer('p3', 'Hráč 3', false);
    this.addPlayer('p4', 'Hráč 4', false);

    this.currentPlayer = this.players[0];

  }
  addPlayer(id: string, pname: string, play: boolean) {
    let xname = localStorage.getItem(id) ?? pname;
    const data = { id: id, name: xname, play: play, rows: [], score: 0 };
    this.players.push(data);
  }

  ngOnInit(): void {
    this.getPlayersCount();
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.players, event.previousIndex, event.currentIndex);
    this.findCurrentPlayer();
  }


  playerClick(player: any) {

    player.play = player.play === true ? false : true;
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
  }

  addScore() {
    if (this.editMode) {
      this.currentPlayer.rows[this.editIndex] = this.scoreValue;
      this.sumScore();
      this.editMode = false;
      this.scoreValue = undefined;
      this.findCurrentPlayer();
    } else {
      this.currentPlayer.rows.push(this.scoreValue);
      this.playSound(<number>this.scoreValue);

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

  }

  getPlayersCount() {
    this.playersCount = this.players.filter(i => i.play === true).length;
  }


  editScore(player: any, index: number) {
    this.editMode = true;
    this.currentPlayer = player;
    this.editIndex = index;
    this.scoreValue = <number>player.rows[index];
    this.playSound(this.scoreValue);
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
    this.players.forEach(player => {
      player.rows = [];
      player.score = 0;
    });
    this.findCurrentPlayer();
  }

  playSound(points: number) {

    const audioContext = new AudioContext();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode); //.connect(merger, 0, 0);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.value = 0.8;
    oscillator.frequency.value = 40 + points * 20;
    oscillator.type = 'sawtooth';
    oscillator.start(0);
   
    oscillator.stop(0.2);

  }




}
