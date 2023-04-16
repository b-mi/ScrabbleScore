import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  players: any[] = [];
  currentPlayer: any;

  scoreValue: number | undefined = undefined;
  playersCount: number = 0;

  rowIds: number[] = [];
  editMode: boolean = false;
  editIndex: number = 0;


  constructor() {

    this.players = [];
    this.addPlayer('Vierka', true);
    this.addPlayer('Bob', true);
    this.addPlayer('Lukáš', false);
    this.addPlayer('Hráč 4', false);

    this.currentPlayer = this.players[0];

  }
  addPlayer(pname: string, play: boolean) {
    const data = { name: pname, play: play, rows: [], score: 0 };
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
    console.log('keyClick', key);

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
      if (this.currentPlayer.rows.length > this.rowIds.length)
        this.rowIds.push(this.rowIds.length);
      this.scoreValue = undefined;
      this.sumScore();
      this.findCurrentPlayer();
    }
  }
  findCurrentPlayer() {
    const plyrs = this.players.filter(i => i.play === true);
    let maxIdx = this.rowIds[this.rowIds.length - 1];

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
  }



}
