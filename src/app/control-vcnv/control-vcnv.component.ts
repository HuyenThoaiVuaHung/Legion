import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { FormPlayerComponent } from '../form-player/form-player.component';
import { FormQVcnvComponent } from '../form-q-vcnv/form-q-vcnv.component';

@Component({
  selector: 'app-control-vcnv',
  templateUrl: './control-vcnv.component.html',
  styleUrls: ['./control-vcnv.component.scss']
})
export class ControlVcnvComponent implements OnInit {
  ifPlayerCNV : boolean = true;
  socket = io(environment.socketIp);
  constructor(
    public router: Router,
    public dialog: MatDialog,
  ) { }
  vcnvData : any = {};
  matchData: any = {};
  currentTime : number = 0;
  authString: string = '';
  playerGetVCNV : any[] = [];
  displayingRow: any = {};
  chosenRow: any = {};
  vcnvMark: boolean[] = [];
  displayedQuestionColumns: string[] = ['id','question', 'answer', 'type', 'value','action'];
  displayedPlayerColumns: string[] = ['id','name', 'score', 'response', 'mark', 'active'];
  displayedVCNVPlayersColumns: string[] = ['id','name', 'mark','time'];
  ngOnInit(): void {
    this.authString = localStorage.getItem('authString') || '';
    console.log(this.authString);
    this.socket.emit('init-authenticate', this.authString, (callback) => {
      if(callback.roleId == 1){
        console.log('Logged in as admin');
        if(callback.matchData.matchPos != 'VCNV_Q' && callback.matchData.matchPos != 'VCNV_A'){
          this.socket.emit('change-match-position', 'VCNV_Q');
        }
        this.matchData = callback.matchData;
        this.socket.on('update-match-data', (data) => {
          this.matchData = data;
          }
        )
        this.socket.on('update-vcnv-data', (data) => {
          this.vcnvData = data;
          console.log(this.vcnvData.questions[5]);
        });
        this.socket.on('update-clock', (clock) => {
          this.currentTime = clock;
        })
        this.socket.emit('get-vcnv-data', (callback) =>{
          this.vcnvData = callback;
          console.log(this.vcnvData.questions[5]);
        });
        this.socket.on('disconnect', () => {
          this.socket.emit('leave-match', (this.authString))
        })
        this.socket.on('player-vcnv-get', (player) => {
          this.playerGetVCNV.push(player);
        })
      }
      else {
        console.log('Wrong token');
        this.router.navigate(['/']);
      }
    });
  }
  playSfx(sfxId: string){
    this.socket.emit('play-sfx', sfxId);
  }
  onDoubleClickPlayer(row: any){
    let player = this.matchData.players[this.matchData.players.indexOf(row)];
    const dialogRef = this.dialog.open(FormPlayerComponent, {
      data: player
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        var payload: any = { player: result, index: this.matchData.players.indexOf(row)};
        payload.player.score = parseInt(payload.player.score);
        this.socket.emit('edit-player-info', payload, (callback) => {
          console.log(callback.message);
        });
      }
    });
  }
  editQuestion(){
    let question = this.vcnvData.questions[this.vcnvData.questions.indexOf(this.chosenRow)];
    const dialogRef = this.dialog.open(FormQVcnvComponent, {
      data: question
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        var payload: any = { question: result, index: this.vcnvData.questions.indexOf(this.chosenRow)};
        payload.question.value = parseInt(payload.question.value);
        this.vcnvData.questions[this.vcnvData.questions.indexOf(this.chosenRow)] = payload.question;
        this.socket.emit('update-vcnv-data', this.vcnvData);
      }
    });
  }
  submitMark(){
    this.socket.emit('submit-mark-vcnv-admin', this.vcnvData.playerAnswers);
  }
  onClickQuestion(row){
    this.chosenRow = row;
  }
  onDoubleClickQuestion(row){
    this.displayingRow = row;
    this.socket.emit('play-sfx', 'VCNV_CHOOSE_ROW') 
    this.socket.emit('highlight-vcnv-question', row.id, (callback) => {
      console.log(callback.message);
    })
  }
  openHN(id: number){
    this.socket.emit('open-hn-vcnv', id);
  }
  showQuestion(){
    this.socket.emit('broadcast-vcnv-question', this.displayingRow.id);
  }
  hideQuestion(){
    this.socket.emit('broadcast-vcnv-question', 6)
  }
  closeHN(id: number){
    this.socket.emit('close-hn-vcnv', id);
  }
  start15sTimer(){
    this.socket.emit('start-clock', 15);
  }
  toggleResultsDisplay(){
    this.socket.emit('toggle-results-display-vcnv');
  }
  toggleAnswerDisplay(){
    if (this.matchData.matchPos == 'VCNV_Q'){
      this.socket.emit('change-match-position', 'VCNV_A');
    }
    else if (this.matchData.matchPos == 'VCNV_A'){
      this.socket.emit('change-match-position', 'VCNV_Q');
    }
  }
  submitVCNVMark(){
    let ifAnswerCorrect: boolean = false;
    console.log(this.vcnvMark);
    for(let i = 0; i < this.vcnvMark.length; i++){
      if(this.vcnvMark[i] == true) ifAnswerCorrect = true;
    }
    if(ifAnswerCorrect){
      this.playSfx('VCNV_OBSTACLE_CORRECT');
      this.socket.emit('open-hn-vcnv', 1);
      this.socket.emit('open-hn-vcnv', 2);
      this.socket.emit('open-hn-vcnv', 3);
      this.socket.emit('open-hn-vcnv', 4);
      this.socket.emit('open-hn-vcnv', 5);

    }
    else{
      this.playSfx('VCNV_WRONG_ROW');
    }
    this.socket.emit('submit-cnv-mark', this.vcnvMark);
  }
  moveToTT(){
    this.router.navigate(['/c-tt']);
  }
}
