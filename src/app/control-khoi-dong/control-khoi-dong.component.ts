import { Component, OnInit } from '@angular/core';
import { Player } from '../services/interfaces/player.interface';
import { KDQuestion } from '../services/interfaces/question.interfaces';
import * as io from 'socket.io-client';
import { Router } from '@angular/router';
import { FormQKdComponent } from '../form-q-kd/form-q-kd.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-control-khoi-dong',
  templateUrl: './control-khoi-dong.component.html',
  styleUrls: ['./control-khoi-dong.component.scss']
})
export class ControlKhoiDongComponent implements OnInit {

  constructor(
    private router: Router,
    public dialog: MatDialog
    ) {

   }
   socket = io.connect('http://localhost:3000');
  questionTableData: KDQuestion[] = [];
  playerTableData: Player[] = [];
  displayingRow: any = null;
  displayedQuestionColumns: string[] = ['question', 'answer'];
  displayedPlayerColumns: string[] = ['id','name', 'score'];
  authString: string = '';
  
  ngOnInit(): void {
    this.authString = localStorage.getItem('authString') || '';
    console.log(this.authString);
    this.socket.emit('init-authenticate', this.authString, (callback) => {
      if(callback.roleId == 1){
        console.log('Logged in as admin');
        this.playerTableData = callback.connectedPlayers;
        this.socket.on('update-connected-players', (data) => {
          this.playerTableData = data; 
          }
        )
        this.socket.emit('get-kd-data-admin', (callback) =>{
          this.questionTableData = callback.questions;
        })
      }
      else {
        console.log('Wrong token');
        this.router.navigate(['/']);
      }
    });
  }
  onClickQuestion(row: any){

    
  }
  onDoubleClickQuestion(row: any){
    this.displayingRow = row;
    let payload = this.questionTableData;
    this.socket.emit('broadcast-kd-question', this.questionTableData.indexOf(this.displayingRow), callback => {
      console.log(callback.message);
    });
  }
  addQuestion(){
    const dialogRef = this.dialog.open(FormQKdComponent, {
      data: { question: '', answer: '', type: '' }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      this.socket.emit('add-kd-question', result, (callback) => {
        console.log(callback.message);
      });
      this.socket.emit('get-kd-data-admin', (callback) =>{
        this.questionTableData = callback.questions;
      });
    });
  }
  removeQuestion(){
  }
}
