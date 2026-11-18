import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MenuItemComponent } from '../../components/menu-item/menu-item.component';
import { POSITION_LABELS } from '../../core/constants';
import { BrandAssetKey } from '../../core/contracts/api';
import { MATCH_POSITIONS, MatchPosition } from '../../core/contracts/game';
import { GameRules } from '../../core/services/config.service';
import { ApiService } from '../../core/services/api.service';
import { AssetService } from '../../core/services/asset.service';
import { ConfigService } from '../../core/services/config.service';
import { ObsService } from '../../core/services/obs.service';
import { PaletteService, ThemeMode } from '../../core/services/palette.service';

/** Preset seed colors offered as quick swatches beside the free picker. */
const PRESET_SEEDS = [
  '#7C4DFF', '#2962FF', '#00BFA5', '#00C853',
  '#FFD600', '#FF6D00', '#D50000', '#C51162',
] as const;

interface BrandAsset {
  key: BrandAssetKey;
  label: string;
  description: string;
  path: string;
}

const BRAND_ASSETS: readonly BrandAsset[] = [
  { key: 'logo', label: 'Logo', description: 'Dấu hiệu Legion hiển thị trên thanh điều hành.', path: 'misc/logo.png' },
  { key: 'wordmark', label: 'Logo dài', description: 'Phiên bản thương hiệu dùng cho màn hình chào.', path: 'misc/legion.png' },
  { key: 'placeholder', label: 'Ảnh chờ', description: 'Hiển thị trước khi câu hỏi có media được mở.', path: 'misc/placeholder.png' },
  { key: 'icon', label: 'Biểu tượng', description: 'Biểu tượng Legion dùng trong giao diện.', path: 'misc/icon.png' },
];

/** One editable numeric rule field, grouped into an operator-style tile. */
type NumericRuleKey = Exclude<
  keyof GameRules,
  'playerCount' | 'obstacleValueByRevealedCount' | 'ttPointsByPlacement'
>;

type EditableGameRules = Omit<GameRules, 'playerCount'>;

interface RuleField {
  key: NumericRuleKey;
  label: string;
  description: string;
  suffix?: string;
  min?: number;
}

interface RuleGroup {
  title: string;
  fields: RuleField[];
}

const RULE_GROUPS: RuleGroup[] = [
  {
    title: 'Khởi động',
    fields: [
      { key: 'kdCorrectPoints', label: 'Điểm trả lời đúng', description: 'Điểm cộng khi thí sinh trả lời đúng.', suffix: 'điểm', min: 0 },
      { key: 'kdWrongPenalty', label: 'Điểm trừ trả lời sai', description: 'Điểm trừ khi bấm chuông và trả lời sai (chế độ đối kháng).', suffix: 'điểm', min: 0 },
      { key: 'kdDecisionTicks', label: 'Số nhịp suy nghĩ', description: 'Số nhịp của cửa sổ trả lời sau khi bấm chuông (nhịp × ms).', min: 1 },
      { key: 'kdClockStartDelayMs', label: 'Độ trễ khởi động đồng hồ', description: 'Khoảng chờ trước khi đồng hồ Khởi động bắt đầu chạy.', suffix: 'ms', min: 0 },
    ],
  },
  {
    title: 'Vượt chướng ngại vật',
    fields: [
      { key: 'vcnvRowPoints', label: 'Điểm mỗi hàng ngang', description: 'Điểm cộng cho mỗi hàng ngang trả lời đúng.', suffix: 'điểm', min: 0 },
    ],
  },
  {
    title: 'Về đích',
    fields: [
      { key: 'vdStealTicks', label: 'Số nhịp cướp câu', description: 'Số nhịp của cửa sổ cướp câu hỏi (nhịp × ms).', min: 1 },
      { key: 'vdWrongPenaltyDivisor', label: 'Hệ số trừ khi sai', description: 'Trả lời sai bị trừ (giá trị câu ÷ hệ số này).', min: 1 },
      { key: 'vdHopeStarMultiplier', label: 'Hệ số Ngôi sao hy vọng', description: 'Nhân điểm khi chọn Ngôi sao hy vọng và trả lời đúng.', suffix: '×', min: 1 },
    ],
  },
  {
    title: 'Câu hỏi phụ',
    fields: [
      { key: 'chpTurnSeconds', label: 'Thời gian suy nghĩ', description: 'Thời gian đồng hồ cho mỗi câu hỏi phụ.', suffix: 'giây', min: 1 },
      { key: 'chpCorrectPoints', label: 'Điểm trả lời đúng', description: 'Điểm cộng cho câu hỏi phụ trả lời đúng.', suffix: 'điểm', min: 0 },
    ],
  },
  {
    title: 'Đồng hồ',
    fields: [
      { key: 'mainClockTickMs', label: 'Nhịp đồng hồ chính', description: 'Khoảng thời gian mỗi nhịp đếm ngược chính.', suffix: 'ms', min: 1 },
      { key: 'decisionTickMs', label: 'Nhịp đồng hồ nhanh', description: 'Khoảng thời gian mỗi nhịp của các đồng hồ quyết định.', suffix: 'ms', min: 1 },
    ],
  },
];

/**
 * Admin settings screen. Same operator-style tiles as the control panels:
 * a live Material-Theme-Builder palette generator plus editable game-rule
 * knobs that persist to the server and broadcast to every client.
 */
@Component({
  selector: 'app-appearance',
  templateUrl: './appearance.component.html',
  styleUrl: './appearance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButton,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatFormField,
    MatLabel,
    MatInput,
    MatSuffix,
    MatSelect,
    MatOption,
    MatProgressSpinner,
    MatSlideToggle,
    MatIcon,
    MenuItemComponent,
  ],
})
export class AppearanceComponent {
  private readonly api = inject(ApiService);
  protected readonly assets = inject(AssetService);
  protected readonly palette = inject(PaletteService);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly config = inject(ConfigService);
  protected readonly obs = inject(ObsService);

  protected readonly presets = PRESET_SEEDS;
  protected readonly brandAssets = BRAND_ASSETS;
  protected readonly uploadingBrandAsset = signal<BrandAssetKey | null>(null);
  private readonly brandAssetRevision = signal(0);
  protected readonly ruleGroups = RULE_GROUPS;
  protected readonly seed = signal(this.palette.savedSeed());
  protected readonly saving = signal(false);

  /** Match positions paired with their labels for OBS scene mapping. */
  protected readonly positions = MATCH_POSITIONS.map((position) => ({
    position,
    label: POSITION_LABELS[position],
  }));
  protected readonly obsUrl = signal(this.obs.savedUrl());
  protected readonly obsPassword = signal('');

  async connectObs(): Promise<void> {
    await this.obs.connect(this.obsUrl(), this.obsPassword());
    if (this.obs.connected()) this.snackBar.open('Đã kết nối OBS', 'Đóng');
    else this.snackBar.open(`Lỗi OBS: ${this.obs.lastError()}`, 'Đóng');
  }

  mapScene(position: MatchPosition, scene: string): void {
    this.obs.mapScene(position, scene);
  }

  brandAssetUrl(path: string): string {
    return `${this.assets.image(path)}?v=${this.brandAssetRevision()}`;
  }

  async onBrandAssetSelected(key: BrandAssetKey, event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.type !== 'image/png') {
      this.snackBar.open('Ảnh phải là PNG.', 'Đóng');
      return;
    }

    this.uploadingBrandAsset.set(key);
    try {
      await this.api.uploadBrandAsset(key, file);
      this.brandAssetRevision.update((revision) => revision + 1);
      this.snackBar.open('Đã cập nhật tài sản thương hiệu.', 'Đóng');
    } catch {
      this.snackBar.open('Không thể tải tài sản thương hiệu lên máy chủ.', 'Đóng');
    } finally {
      this.uploadingBrandAsset.set(null);
    }
  }

  /** Working copy resets when an initial/server rule snapshot arrives. */
  protected readonly draft = linkedSignal<EditableGameRules>(() => this.snapshot());

  /** Fields whose draft value differs from the applied server value. */
  protected readonly dirty = computed(
    () => JSON.stringify(this.draft()) !== JSON.stringify(this.snapshot()),
  );

  /** The board's player count is structural; every other game-rule value is editable. */
  protected readonly obstacleRevealCounts = [0, 1, 2, 3, 4, 5] as const;
  protected readonly ttPlacements = [0, 1, 2, 3] as const;

  private snapshot(): EditableGameRules {
    const { playerCount: _playerCount, ...rules } = this.config.rules();
    return {
      ...rules,
      obstacleValueByRevealedCount: { ...rules.obstacleValueByRevealedCount },
      ttPointsByPlacement: [...rules.ttPointsByPlacement],
    };
  }

  setField(key: NumericRuleKey, value: number | string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    this.draft.update((draft) => ({ ...draft, [key]: parsed }));
  }

  setObstacleValue(revealedCount: number, value: number | string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    this.draft.update((draft) => ({
      ...draft,
      obstacleValueByRevealedCount: {
        ...draft.obstacleValueByRevealedCount,
        [revealedCount]: parsed,
      },
    }));
  }

  setTtPlacementPoints(placement: number, value: number | string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;
    this.draft.update((draft) => {
      const ttPointsByPlacement = [...draft.ttPointsByPlacement];
      ttPointsByPlacement[placement] = parsed;
      return { ...draft, ttPointsByPlacement };
    });
  }

  revert(): void {
    this.draft.set(this.snapshot());
  }

  async saveRules(): Promise<void> {
    this.saving.set(true);
    try {
      await this.config.updateRules(this.draft());
      this.draft.set(this.snapshot());
      this.snackBar.open('Đã lưu thông số trận đấu', 'Đóng');
    } catch {
      this.snackBar.open('Không thể lưu thông số', 'Đóng');
    } finally {
      this.saving.set(false);
    }
  }

  onSeedChange(hex: string): void {
    this.seed.set(hex);
    this.palette.setSeed(hex);
  }

  onModeChange(mode: ThemeMode): void {
    this.palette.setMode(mode);
  }

  resetPalette(): void {
    this.palette.reset();
    this.seed.set(PaletteService.DEFAULT_SEED);
  }
}
