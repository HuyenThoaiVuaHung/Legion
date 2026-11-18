import { Component } from "@angular/core";
import { getControlUrlFromMatchPosition } from "../services/tools";
import { Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { MatDialog } from "@angular/material/dialog";
import { FormConfigComponent } from "../components/forms/form-config/form-config.component";
import { ConfigService } from "../services/config.service";
import { SfxService } from "../services/sfx-service.service";

/** One round-control destination in the admin tab navigation. */
interface NavItem {
  route: string;
  label: string;
  icon: string;
  /** The dashboard link must match exactly; round links match by prefix. */
  exact?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { route: '/admin/dashboard', label: 'Tổng quan', icon: 'dashboard', exact: true },
  { route: '/admin/kd', label: 'Khởi động', icon: 'grass' },
  { route: '/admin/vcnv', label: 'Vượt chướng ngại vật', icon: 'landscape' },
  { route: '/admin/tt', label: 'Tăng tốc', icon: 'rocket_launch' },
  { route: '/admin/vd', label: 'Về đích', icon: 'military_tech' },
  { route: '/admin/chp', label: 'Câu hỏi phụ', icon: 'workspaces' },
];

/** Shell for the admin control panels: toolbar + tab navigation + points toggle. */
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatToolbar,
    MatTabsModule,
    MatIcon,
    MatIconButton,
    MatButton,
    MatTooltip,
  ],
})
export class AdminComponent {
  constructor(private router: Router, public auth: AuthService, private dialog: MatDialog, private config: ConfigService, private sfxService: SfxService) {}
  changeMatchPosAdmin(pos: string) {
    this.router.navigate([getControlUrlFromMatchPosition(pos)]);
  }
  private matchPosCache: string = "";
  togglePoints() {
    this.auth.socket.emit("get-match-data", (data: { matchPos: string }) => {
      if (data.matchPos == "PNTS") {
        if (this.matchPosCache)
          this.router.navigate([
            getControlUrlFromMatchPosition(this.matchPosCache),
          ]);
        this.auth.socket.emit(
          "change-match-position",
          this.matchPosCache,
          localStorage.getItem("authString")
        );
      } else {
        this.matchPosCache = data.matchPos;
        this.auth.socket.emit(
          "change-match-position",
          "PNTS",
          localStorage.getItem("authString")
        );
      }
    });
  }

  async togglePoints(): Promise<void> {
    const position = this.session.match()?.position;
    if (!position) return;
    if (position === 'PNTS') {
      this.session.match.set(await this.api.setPosition(this.positionBeforePoints));
    } else {
      this.positionBeforePoints = position;
      this.session.match.set(await this.api.setPosition('PNTS'));
    }
  }
  stopKdLoopingAudio() {
    this.auth.socket.emit("stop-kd-sound");
  }
}
