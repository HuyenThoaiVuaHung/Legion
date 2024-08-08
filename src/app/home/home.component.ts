import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Signal,
  computed,
} from "@angular/core";
import * as XLSX from "xlsx";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { FormPlayerComponent } from "../form-player/form-player.component";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  constructor(
    private router: Router,
    public auth: AuthService,
    private dialog: MatDialog
  ) {}
  displayedPlayerColumns: string[] = ["id", "name", "score", "active"];
  authString: string = "";
  greetString: Signal<string> = computed(() => {
    switch (this.auth.userInfo().roleId) {
      case 0:
        return this.auth.matchData().players[this.auth.userInfo().index || 0]
          .name;
      case 1:
        this.auth.socket.emit("change-match-position", "H");
        return "Ban tổ chức";
      case 2:
        return "Người dẫn chương trình";
      case 3:
        return "Viewer";
      default:
        return "Chào bạn";
    }
  });
  fileName = "";
  ngOnInit(): void {
    this.auth.deauthenticate();
  }
  authenticate() {
    this.auth.authenticate(this.authString);
    localStorage.setItem("authString", this.authString);
  }
  editPlayer(row: any) {
    let player =
      this.auth.matchData().players[this.auth.matchData().players.indexOf(row)];
    const dialogRef = this.dialog.open(FormPlayerComponent, {
      data: player,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        var payload: any = {
          player: result,
          index: this.auth.matchData().players.indexOf(row),
        };
        payload.player.score = parseInt(payload.player.score);
        this.auth.socket.emit("edit-player-info", payload, (callback) => {
          console.debug(callback.message);
        });
      }
    });
  }
  onFileSelected(event) {
    const file: File = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = (e) => {
        const bufferArray = e.target?.result;
        const wb = XLSX.read(bufferArray, { type: "buffer" });
        const kdSheet = wb.Sheets[wb.SheetNames[0]];
        const vcnvSheet = wb.Sheets[wb.SheetNames[1]];
        const ttSheet = wb.Sheets[wb.SheetNames[2]];
        const vdSheet = wb.Sheets[wb.SheetNames[3]];
        const payload: any = {
          kd: XLSX.utils.sheet_to_json(kdSheet),
          vcnv: XLSX.utils.sheet_to_json(vcnvSheet),
          tt: XLSX.utils.sheet_to_json(ttSheet),
          vd: XLSX.utils.sheet_to_json(vdSheet),
        };
        this.auth.socket.emit("update-data-from-excel", payload, (callback) => {
          console.debug(callback.message);
        });
        console.debug(payload);
      };
    }
  }
}
