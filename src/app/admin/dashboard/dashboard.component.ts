import { FormPlayerComponent } from "src/app/components/forms/form-player/form-player.component";
import { Component } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from "src/app/services/auth.service";
import * as XLSX from "xlsx";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class AdminDashboardComponent {
  constructor(public auth: AuthService, private dialog: MatDialog) {}

  displayedPlayerColumns: string[] = ["id", "name", "score", "active"];
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
  public fileName: String = "";

  onFileSelected(event: any) {
    const file: File = event.target!.files[0];
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
