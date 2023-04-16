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

  scoreValue: number = 0;
  playersCount: number = 0;


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
  }

  playerClick(player: any) {
    player.play = player.play === true ? false : true;
    this.getPlayersCount();
  }

  keyClick(key: string) {
    console.log('keyClick', key);

    var val: number = this.scoreValue ?? 0;
    var sval: string = String(val);
    var newVal: number = val;
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
    this.currentPlayer.rows.push(this.scoreValue);
    this.scoreValue = 0;


    const plyrs = this.players.filter(i => i.play === true);
    const idx = plyrs.indexOf(this.currentPlayer);
    if (idx == plyrs.length - 1)
      this.currentPlayer = plyrs[0];
    else
      this.currentPlayer = plyrs[idx + 1];

    console.log('add score', this.scoreValue);
  }

  getPlayersCount() {
    this.playersCount = this.players.filter(i => i.play === true).length;
  }



}
