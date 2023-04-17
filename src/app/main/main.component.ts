import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatChipSelectionChange } from '@angular/material/chips';

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

  isEditingPlayerName: boolean = false;
  playerName: string = '';
  editedPlayer: any;


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


  playerClick2($event: MatChipSelectionChange, player: any) {
    player.play = $event.selected;
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

  renamePlayer(player: any) {
    this.playerName = player.name;
    this.editedPlayer = player;
    this.isEditingPlayerName = true;
    console.log('rena', player);

  }

  savePlayerName() {
    this.editedPlayer.name = this.playerName;
    localStorage.setItem(this.editedPlayer.id, this.playerName);
    this.isEditingPlayerName = false;
    this.playerName = '';
    this.editedPlayer = undefined;
  }



}
