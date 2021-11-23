import { Component, OnInit } from '@angular/core';
import { Player } from '../services/interfaces/player.interface';
import { KDQuestion } from '../services/interfaces/question.interfaces';


@Component({
  selector: 'app-control-khoi-dong',
  templateUrl: './control-khoi-dong.component.html',
  styleUrls: ['./control-khoi-dong.component.scss']
})
export class ControlKhoiDongComponent implements OnInit {

  constructor() {

   }
  questionTableData: KDQuestion[] = [
    {question: '1. What is the name of the first planet in our solar system?', answer: 'Mercury', id: 1},
    {question: '2. What is the name of the second planet in our solar system?', answer: 'Venus', id: 2},
    {question: '3. What is the name of the third planet in our solar system?', answer: 'Earth', id: 3},
    {question: '4. What is the name of the fourth planet in our solar system?', answer: 'Mars', id: 4},
    {question: '5. What is the name of the fifth planet in our solar system?', answer: 'Jupiter', id: 5},
    {question: '6. What is the name of the sixth planet in our solar system?', answer: 'Saturn', id: 6},
    {question: '7. What is the name of the seventh planet in our solar system?', answer: 'Uranus', id: 7},
    {question: '8. What is the name of the eighth planet in our solar system?', answer: 'Neptune', id: 8},
    {question: '9. What is the name of the ninth planet in our solar system?', answer: 'Pluto', id: 9},
    {question: '10. What is the name of the tenth planet in our solar system?', answer: 'Moon', id: 10},
    {question: '11. What is the name of the eleventh planet in our solar system?', answer: 'Sun', id: 11},
    {question: '12. What is the name of the twelfth planet in our solar system?', answer: 'Mercury', id: 12},
    {question: '13. What is the name of the thirteenth planet in our solar system?', answer: 'Venus', id: 13},
    {question: '14. What is the name of the fourteenth planet in our solar system?', answer: 'Earth', id: 14},
    {question: '15. What is the name of the fifteenth planet in our solar system?', answer: 'Mars', id: 15},
    {question: '16. What is the name of the sixteenth planet in our solar system?', answer: 'Jupiter', id: 16},
    {question: '17. What is the name of the seventeenth planet in our solar system?', answer: 'Saturn', id: 17},
    {question: '18. What is the name of the eighteenth planet in our solar system?', answer: 'Uranus', id: 18},
    {question: '19. What is the name of the nineteenth planet in our solar system?', answer: 'Neptune', id: 19},
    {question: '20. What is the name of the twentieth planet in our solar system?', answer: 'Pluto', id: 20},
    {question: '21. What is the name of the twenty first planet in our solar system?', answer: 'Moon', id: 21},
    {question: '22. What is the name of the twenty second planet in our solar system?', answer: 'Sun', id: 22},
    {question: '23. What is the name of the twenty third planet in our solar system?', answer: 'Mercury', id: 23},
    {question: '24. What is the name of the twenty fourth planet in our solar system?', answer: 'Venus', id: 24},
    {question: '25.  What is the name of the twenty fifth planet in our solar system?', answer: 'Earth', id: 25},
    {question: '26. What is the name of the twenty sixth planet in our solar system?', answer: 'Mars', id: 26},
    {question: '27. What is the name of the twenty seventh planet in our solar system?', answer: 'Jupiter', id: 27},
    {question: '28. What is the name of the twenty eighth planet in our solar system?', answer: 'Saturn', id: 28},
    {question: '29. What is the name of the twenty ninth planet in our solar system?', answer: 'Uranus', id: 29},
    {question: '30. What is the name of the thirtieth planet in our solar system?', answer: 'Neptune', id: 30},
  ];
  playerTableData: Player[] = [
    {name: 'Nguyễn Văn A', score: 0, id: 1},
    {name: 'Nguyễn Văn B', score: 0, id: 2},
    {name: 'Nguyễn Văn C', score: 0, id: 3},
    {name: 'Nguyễn Văn D', score: 0, id: 4},
  ]
  displayedQuestionColumns: string[] = ['id','question', 'answer'];
  displayedPlayerColumns: string[] = ['id','name', 'score'];
  ngOnInit(): void {

  }
  
}
