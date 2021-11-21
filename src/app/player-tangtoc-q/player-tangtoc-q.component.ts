import { Component, OnInit } from '@angular/core';
declare var videojs: any;
@Component({
  selector: 'app-player-tangtoc-q',
  templateUrl: './player-tangtoc-q.component.html',
  styleUrls: ['./player-tangtoc-q.component.scss']
})
export class PlayerTangtocQComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  togglePlay(){
    var myPlayer = videojs('video-1');
    if (myPlayer.paused()) {
      myPlayer.play();
    }
    else {
      myPlayer.pause();
    }
  }
}
