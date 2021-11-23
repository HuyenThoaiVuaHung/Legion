import { Component, OnInit } from '@angular/core';
import { Player } from '../services/interfaces/player.interface';
import { VCNVQuestion } from '../services/interfaces/question.interfaces';

@Component({
  selector: 'app-control-vcnv',
  templateUrl: './control-vcnv.component.html',
  styleUrls: ['./control-vcnv.component.scss']
})
export class ControlVcnvComponent implements OnInit {
  ifPlayerCNV : boolean = true;
  constructor() { }
  questionTableData: VCNVQuestion[] = [
    {question: 'Lorem ipsum sumit elmait', answer: 'Lorem ipsum sumit elmait', type: 'HN_S', value: 10, id: 1},
    {question: 'Lorem ipsum sumit elmait', answer: 'Lorem ipsum sumit elmait', type: 'HN', value: 10, id: 2},
    {question: 'Lorem ipsum sumit elmait', answer: 'Lorem ipsum sumit elmait', type: 'HN', value: 10, id: 3},
    {question: 'Lorem ipsum sumit elmait', answer: 'Lorem ipsum sumit elmait', type: 'HN', value: 10, id: 4},
    {question: 'Lorem ipsum sumit elmait', answer: 'Lorem ipsum sumit elmait', type: 'HN', value: 10, id: 5},
    {question: '', answer: 'XUÂN QUỲNH', type: 'CNV', value: 40, id: 6},
  ];
  playerTableData: Player[] = [
    {name: 'Nguyễn Văn A', score: 0, id: 1, answerVCNV: 'Lorem ipsum sumit elmait'},
    {name: 'Nguyễn Văn B', score: 0, id: 2, answerVCNV: 'Lorem ipsum sumit elmait'},
    {name: 'Nguyễn Văn C', score: 0, id: 3, answerVCNV: 'Lorem ipsum sumit elmait'},
    {name: 'Nguyễn Văn D', score: 0, id: 4, answerVCNV: 'Lorem ipsum sumit elmait'},
  ];
  displayedQuestionColumns: string[] = ['id','question', 'answer', 'type', 'value','action'];
  displayedPlayerColumns: string[] = ['id','name', 'score', 'response', 'mark'];
  ngOnInit(): void {
  }

}
