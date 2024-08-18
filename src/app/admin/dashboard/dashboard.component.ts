import { FormPlayerComponent } from "src/app/components/forms/form-player/form-player.component";
import {
  Component,
  computed,
  signal,
  Signal,
  WritableSignal,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { AuthService } from "src/app/services/auth.service";
import * as XLSX from "xlsx";
import {
  ChpData,
  KdData,
  Question,
  TtData,
  Type,
  VcnvData,
  VdData,
} from "src/app/services/types/game";
import { normalizeQuestion } from "../utils/question.adapter";
import { ValueChangeEvent } from "@angular/forms";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class AdminDashboardComponent {
  constructor(public auth: AuthService, private dialog: MatDialog) {
    this.auth.resetListeners();
    this.auth.socket.emit("get-kd-data-admin", (callback: KdData) => {
      this.KdData.set(callback);
    });
    this.auth.socket.emit("get-vcnv-data", (callback: VcnvData) => {
      this.VcnvData.set(callback);
    });
    this.auth.socket.emit("get-tangtoc-data", (callback: TtData) => {
      this.TtData.set(callback);
    });
    this.auth.socket.emit("get-vedich-data", (callback: VdData) => {
      this.VdData.set(callback);
    });
    this.auth.socket.emit("get-chp-data", (callback: ChpData) => {
      this.ChpData.set(callback);
    });
    this.auth.socket.on("update-kd-data-admin", (callback: KdData) => {
      this.KdData.set(callback);
    });
    this.auth.socket.on("update-vcnv-data", (callback: VcnvData) => {
      this.VcnvData.set(callback);
    });
    this.auth.socket.on("update-tangtoc-data", (callback: TtData) => {
      this.TtData.set(callback);
    });
    this.auth.socket.on("update-vedich-data", (callback: VdData) => {
      this.VdData.set(callback);
    });
    this.auth.socket.on("update-chp-data", (callback: ChpData) => {
      this.ChpData.set(callback);
    });
  }
  public readonly type = Type;
  public displayedQuestionColumns: string[] = ["question", "answer", "type"];
  public chosenRow: Question | undefined;
  displayedPlayerColumns: string[] = ["id", "name", "score", "active"];
  public currentQuestionList: WritableSignal<
    "kd" | "vcnv" | "tt" | "vd" | "chp"
  > = signal("kd");

  public questionList: Signal<Question[]> = computed(() => {
    return (() => {
      switch (this.currentQuestionList()) {
        case "vcnv":
          return this.VcnvData().questions;
        case "tt":
          return this.TtData().questions;
        case "vd":
          console.log(this.VdData().currentPlayerId);
          return this.VdData().currentPlayerId > 0
            ? this.VdData().questionPools[this.VdData().currentPlayerId - 1]
            : [];
        case "chp":
          return this.ChpData().questions;
        default:
        case "kd":
          if (this.KdData().gamemode == "M")
            return this.KdData().questions.multiplayer;
          else
            return this.KdData().questions.singleplayer[
              this.KdData().currentSingleplayerPlayer
            ];
      }
    })().map((q) => normalizeQuestion(q));
  });

  public KdData: WritableSignal<KdData> = signal({} as KdData);
  public VcnvData: WritableSignal<VcnvData> = signal({} as VcnvData);
  public TtData: WritableSignal<TtData> = signal({} as TtData);
  public VdData: WritableSignal<VdData> = signal({} as VdData);
  public ChpData: WritableSignal<ChpData> = signal({} as ChpData);

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
  public onClickRow(row: Question) {
    this.chosenRow = row;
  }
  public fileName: String = "";

  public changeKdPlayerIndex(event: number) {
    this.KdData.set({
      ...this.KdData(),
      currentSingleplayerPlayer: event,
    });
  }

  public changeKdGamemode(event: "S" | "M") {
    this.KdData.set({
      ...this.KdData(),
      gamemode: event,
    });
  }

  public changeVdPlayerIndex(event: number) {
    this.VdData.set({
      ...this.VdData(),
      currentPlayerId: event,
    });
  }
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
