import { Component, computed, input, ChangeDetectionStrategy, inject } from '@angular/core';
import {
  ChpQuestion,
  KdQuestion,
  RoundKind,
  TtQuestion,
  VcnvQuestion,
  VdQuestion,
} from '../../core/contracts/game';
import { MediaService } from '../../core/services/media.service';
import { MenuItemComponent } from '../menu-item/menu-item.component';

export type PreviewQuestion = KdQuestion | VcnvQuestion | TtQuestion | VdQuestion | ChpQuestion;

interface PreviewItem {
  kind: 'image' | 'audio' | 'video';
  url: string;
  alt: string;
}

@Component({
  selector: 'app-media-preview',
  imports: [MenuItemComponent],
  templateUrl: './media-preview.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './media-preview.component.scss',
})
export class MediaPreviewComponent {
  private readonly media = inject(MediaService);

  readonly kind = input.required<RoundKind>();
  readonly question = input.required<PreviewQuestion>();

  readonly items = computed<PreviewItem[]>(() => {
    const kind = this.kind();
    const question = this.question();
    switch (kind) {
      case 'kd': {
        const q = question as KdQuestion;
        if (q.type === 'A' && q.mediaFile) {
          return [{ kind: 'audio', url: this.media.resolve('kd', q.mediaFile), alt: 'Âm thanh câu hỏi' }];
        }
        if (q.type === 'P' && q.mediaFile) {
          return [{ kind: 'image', url: this.media.resolve('kd', q.mediaFile), alt: 'Hình ảnh câu hỏi' }];
        }
        return [];
      }
      case 'vcnv': {
        const q = question as VcnvQuestion;
        if (q.type === 'CNV' && q.imageFile) {
          return [{ kind: 'image', url: this.media.resolve('vcnv', q.imageFile), alt: 'Hình ảnh chướng ngại vật' }];
        }
        if (q.type === 'HN_S' && q.audioFile) {
          return [{ kind: 'audio', url: this.media.resolve('vcnv', q.audioFile), alt: 'Âm thanh câu hỏi' }];
        }
        return [];
      }
      case 'tt': {
        const q = question as TtQuestion;
        if (q.type === 'video' && q.videoFile) {
          return [{ kind: 'video', url: this.media.resolve('tt', q.videoFile), alt: 'Video câu hỏi' }];
        }
        if (q.type === 'image') {
          const items: PreviewItem[] = [];
          if (q.questionImage) {
            items.push({ kind: 'image', url: this.media.resolve('tt', q.questionImage), alt: 'Hình ảnh câu hỏi' });
          }
          if (q.answerImage) {
            items.push({ kind: 'image', url: this.media.resolve('tt', q.answerImage), alt: 'Hình ảnh đáp án' });
          }
          return items;
        }
        return [];
      }
      case 'vd': {
        const q = question as VdQuestion;
        if (!q.mediaFile) return [];
        if (q.type === 'A') return [{ kind: 'audio', url: this.media.resolve('vd', q.mediaFile), alt: 'Âm thanh câu hỏi' }];
        if (q.type === 'V') return [{ kind: 'video', url: this.media.resolve('vd', q.mediaFile), alt: 'Video câu hỏi' }];
        if (q.type === 'I') return [{ kind: 'image', url: this.media.resolve('vd', q.mediaFile), alt: 'Hình ảnh câu hỏi' }];
        return [];
      }
      default:
        return [];
    }
  });
}
