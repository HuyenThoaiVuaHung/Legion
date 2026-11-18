import { computed, Injectable, signal } from '@angular/core';
import JSZip from 'jszip';
import {
  EDITOR_MEDIA_FOLDERS,
  EDITOR_PLAYER_COUNT,
  EDITOR_TT_QUESTION_COUNT,
  EDITOR_VCNV_ROW_COUNT,
  EditorDocument,
  EditorIndexEntry,
  EditorQuestion,
  EditorQuestionType,
  EditorRoundKind,
} from './editor.models';

const DOCUMENT_FILE = 'editorData.json';
const INDEX_STORAGE_KEY = 'legion.browser-editor.index.v1';
const MAX_ARCHIVE_ENTRIES = 1_000;

interface OpfsWritable {
  write(data: Blob | string): Promise<void>;
  close(): Promise<void>;
}

interface OpfsFileHandle {
  getFile(): Promise<File>;
  createWritable(): Promise<OpfsWritable>;
}

interface OpfsDirectoryHandle {
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<OpfsDirectoryHandle>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<OpfsFileHandle>;
  removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
}

interface StorageManagerWithOpfs {
  getDirectory?: () => Promise<OpfsDirectoryHandle>;
}

export type BrowserEditorStatus = 'idle' | 'loading' | 'saving' | 'saved' | 'error';

/**
 * Local-first editor store. It deliberately has no HTTP, socket, auth, or
 * backend dependency: document JSON and media files live entirely in the
 * browser's Origin Private File System (OPFS) until the operator exports them.
 */
@Injectable({ providedIn: 'root' })
export class BrowserEditorService {
  readonly documents = signal<EditorIndexEntry[]>([]);
  readonly activeDocument = signal<EditorDocument | null>(null);
  readonly status = signal<BrowserEditorStatus>('idle');
  readonly lastError = signal('');
  readonly supported = signal(false);
  readonly hasActiveDocument = computed(() => this.activeDocument() !== null);

  private rootPromise: Promise<OpfsDirectoryHandle> | null = null;
  private saveTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly mediaUrls = new Map<string, string>();

  constructor() {
    void this.refreshDocuments();
  }

  async refreshDocuments(): Promise<void> {
    this.status.set('loading');
    try {
      await this.root();
      this.documents.set(this.readIndex().sort((a, b) => b.dateModified - a.dateModified));
      this.supported.set(true);
      this.status.set('idle');
    } catch (error) {
      this.fail(error);
    }
  }

  async createDocument(): Promise<void> {
    const document = createDocument();
    this.activeDocument.set(document);
    await this.persist(document);
  }

  async openDocument(uid: string): Promise<void> {
    this.status.set('loading');
    try {
      const text = await this.readText(`${uid}/${DOCUMENT_FILE}`);
      const document = normalizeDocument(JSON.parse(text), uid);
      this.activeDocument.set(document);
      this.status.set('idle');
    } catch (error) {
      this.fail(error);
    }
  }

  closeDocument(): void {
    this.activeDocument.set(null);
    this.status.set('idle');
  }

  /** Apply an Angular component's local edit and persist it after a short debounce. */
  update(mutator: (document: EditorDocument) => void): void {
    const current = this.activeDocument();
    if (!current) return;
    const next = structuredClone(current);
    mutator(next);
    next.dateModified = Date.now();
    this.activeDocument.set(next);
    this.queuePersist(next);
  }

  async saveNow(): Promise<void> {
    const document = this.activeDocument();
    if (document) await this.persist(document);
  }

  async deleteDocument(uid: string): Promise<void> {
    try {
      const root = await this.root();
      await root.removeEntry(uid, { recursive: true });
      const entries = this.readIndex().filter((entry) => entry.uid !== uid);
      this.writeIndex(entries);
      this.documents.set(entries);
      if (this.activeDocument()?.uid === uid) this.closeDocument();
    } catch (error) {
      this.fail(error);
    }
  }

  /** Save a selected browser file privately, returning its stable archive name. */
  async saveMedia(kind: EditorRoundKind, file: File): Promise<string> {
    const document = this.activeDocument();
    if (!document) throw new Error('No editor document is open');
    const extension = safeExtension(file.name);
    const name = `${crypto.randomUUID()}.${extension}`;
    await this.writeBlob(`${document.uid}/${kind}/${name}`, file);
    this.clearMediaUrl(kind, name);
    return name;
  }

  /** Resolve a locally stored media file for a preview without any network request. */
  async mediaUrl(kind: EditorRoundKind, name: string | undefined): Promise<string | null> {
    const document = this.activeDocument();
    if (!document || !name || !safeSegment(name)) return null;
    const key = `${document.uid}/${kind}/${name}`;
    const cached = this.mediaUrls.get(key);
    if (cached) return cached;

    try {
      const file = await this.readFile(key);
      const url = URL.createObjectURL(file);
      this.mediaUrls.set(key, url);
      return url;
    } catch {
      return null;
    }
  }

  /** Export the active document and all referenced local media as a .legion ZIP. */
  async exportDocument(): Promise<void> {
    const document = this.activeDocument();
    if (!document) return;

    this.status.set('saving');
    try {
      const archive = new JSZip();
      archive.file(DOCUMENT_FILE, JSON.stringify(document));
      for (const [kind, name] of referencedMedia(document)) {
        try {
          archive.file(`${kind}/${name}`, await this.readFile(`${document.uid}/${kind}/${name}`));
        } catch {
          // A missing optional preview file must not prevent an otherwise valid export.
        }
      }
      const blob = await archive.generateAsync({ type: 'blob' });
      triggerDownload(blob, `${safeDownloadName(document.matchData.matchName)}.legion`);
      this.status.set('saved');
    } catch (error) {
      this.fail(error);
    }
  }

  /** Import a legacy .lg or current .legion archive into browser-private storage. */
  async importDocument(file: File): Promise<void> {
    this.status.set('loading');
    try {
      const archive = await JSZip.loadAsync(file);
      const dataEntry = archive.file(DOCUMENT_FILE);
      if (!dataEntry) throw new Error(`Thiếu ${DOCUMENT_FILE}`);
      const uid = crypto.randomUUID();
      const document = normalizeDocument(JSON.parse(await dataEntry.async('text')), uid);

      const entries = Object.values(archive.files).filter((entry) => !entry.dir && entry.name !== DOCUMENT_FILE);
      if (entries.length > MAX_ARCHIVE_ENTRIES) throw new Error('File có quá nhiều tài nguyên');
      for (const entry of entries) {
        const [kind, ...nameParts] = entry.name.replace(/\\/g, '/').split('/').filter(Boolean);
        const name = nameParts.join('/');
        if (!isEditorMediaFolder(kind) || !safeSegment(name)) continue;
        await this.writeBlob(`${uid}/${kind}/${name}`, await entry.async('blob'));
      }

      this.activeDocument.set(document);
      await this.persist(document);
    } catch (error) {
      this.fail(error);
    }
  }

  private queuePersist(document: EditorDocument): void {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.status.set('saving');
    this.saveTimer = setTimeout(() => void this.persist(document), 300);
  }

  private async persist(document: EditorDocument): Promise<void> {
    this.status.set('saving');
    try {
      await this.writeText(`${document.uid}/${DOCUMENT_FILE}`, JSON.stringify(document));
      const entries = this.readIndex().filter((entry) => entry.uid !== document.uid);
      entries.push({
        uid: document.uid,
        matchName: document.matchData.matchName,
        dateModified: document.dateModified,
      });
      entries.sort((a, b) => b.dateModified - a.dateModified);
      this.writeIndex(entries);
      this.documents.set(entries);
      this.status.set('saved');
    } catch (error) {
      this.fail(error);
    }
  }

  private async root(): Promise<OpfsDirectoryHandle> {
    if (!this.rootPromise) {
      const storage = navigator.storage as StorageManagerWithOpfs;
      if (!storage.getDirectory) throw new Error('Trình duyệt không hỗ trợ bộ nhớ cục bộ cho Editor');
      this.rootPromise = storage.getDirectory();
    }
    return this.rootPromise;
  }

  private async fileHandle(path: string, create = true): Promise<OpfsFileHandle> {
    const parts = path.split('/').filter(Boolean);
    const name = parts.pop();
    if (!name || !parts.every(safeSegment) || !safeSegment(name)) throw new Error('Đường dẫn cục bộ không hợp lệ');
    let directory = await this.root();
    for (const part of parts) directory = await directory.getDirectoryHandle(part, { create });
    return directory.getFileHandle(name, { create });
  }

  private async readFile(path: string): Promise<File> {
    return (await this.fileHandle(path, false)).getFile();
  }

  private async readText(path: string): Promise<string> {
    return (await this.readFile(path)).text();
  }

  private async writeBlob(path: string, blob: Blob): Promise<void> {
    const writer = await (await this.fileHandle(path)).createWritable();
    await writer.write(blob);
    await writer.close();
  }

  private async writeText(path: string, text: string): Promise<void> {
    const writer = await (await this.fileHandle(path)).createWritable();
    await writer.write(text);
    await writer.close();
  }

  private readIndex(): EditorIndexEntry[] {
    try {
      const raw = localStorage.getItem(INDEX_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as unknown) : [];
      return Array.isArray(parsed)
        ? parsed.filter(isIndexEntry)
        : [];
    } catch {
      return [];
    }
  }

  private writeIndex(entries: EditorIndexEntry[]): void {
    localStorage.setItem(INDEX_STORAGE_KEY, JSON.stringify(entries));
  }

  private clearMediaUrl(kind: EditorRoundKind, name: string): void {
    const document = this.activeDocument();
    if (!document) return;
    const key = `${document.uid}/${kind}/${name}`;
    const url = this.mediaUrls.get(key);
    if (url) URL.revokeObjectURL(url);
    this.mediaUrls.delete(key);
  }

  private fail(error: unknown): void {
    this.lastError.set(error instanceof Error ? error.message : String(error));
    this.status.set('error');
  }
}

function createDocument(): EditorDocument {
  const players = Array.from({ length: EDITOR_PLAYER_COUNT }, (_, index) => ({
    name: `Thí sinh ${index + 1}`,
    score: 0,
    isReady: false,
  }));
  const blankQuestion = (): EditorQuestion => ({
    question: '',
    answer: '',
    type: EditorQuestionType.Text,
    value: 0,
  });

  return {
    uid: crypto.randomUUID(),
    dateModified: Date.now(),
    uiConfig: { darkMode: false, pallette: 0, miscImageSrcNames: {} },
    matchData: { matchName: 'Trận đấu mới', matchVersion: 24, matchPos: 0, players },
    questionBank: {
      kd: {
        o24Questions: {
          singleplayer: Array.from({ length: EDITOR_PLAYER_COUNT }, () => []),
          multiplayer: [],
        },
      },
      vcnv: {
        questions: Array.from({ length: EDITOR_VCNV_ROW_COUNT }, () => ({
          ...blankQuestion(),
          value: 10,
        })),
        cnv: '',
        cnvMediaSrcNames: [],
      },
      tt: {
        questions: Array.from({ length: EDITOR_TT_QUESTION_COUNT }, () => ({
          ...blankQuestion(),
          type: EditorQuestionType.Image,
        })),
      },
      vd: { questions: Array.from({ length: EDITOR_PLAYER_COUNT }, () => []) },
      chp: { questions: [] },
    },
  };
}

function normalizeDocument(value: unknown, uid: string): EditorDocument {
  if (!value || typeof value !== 'object') throw new Error('Dữ liệu Editor không hợp lệ');
  const source = value as Partial<EditorDocument>;
  const fresh = createDocument();
  const players = Array.isArray(source.matchData?.players)
    ? source.matchData.players.slice(0, EDITOR_PLAYER_COUNT).map((player, index) => ({
        name: typeof player?.name === 'string' ? player.name : `Thí sinh ${index + 1}`,
        score: Number.isFinite(player?.score) ? Number(player.score) : 0,
        isReady: Boolean(player?.isReady),
      }))
    : fresh.matchData.players;
  while (players.length < EDITOR_PLAYER_COUNT) {
    players.push({ name: `Thí sinh ${players.length + 1}`, score: 0, isReady: false });
  }

  const bank = source.questionBank;
  if (!bank || typeof bank !== 'object') throw new Error('Dữ liệu câu hỏi không hợp lệ');
  // The original editor serialized enum keys as SINGLEPLAYER/MULTIPLAYER;
  // newer exports use lowercase keys. Accept both without any server migration.
  const o24 = bank.kd?.o24Questions as unknown as Record<string, unknown> | undefined;
  const importedSingleplayer = o24?.['singleplayer'] ?? o24?.['SINGLEPLAYER'];
  const importedMultiplayer = o24?.['multiplayer'] ?? o24?.['MULTIPLAYER'];
  const singleplayer = Array.isArray(importedSingleplayer)
    ? importedSingleplayer.slice(0, EDITOR_PLAYER_COUNT).map(asQuestions)
    : fresh.questionBank.kd.o24Questions.singleplayer;
  while (singleplayer.length < EDITOR_PLAYER_COUNT) singleplayer.push([]);

  return {
    uid,
    dateModified: Date.now(),
    uiConfig: {
      darkMode: Boolean(source.uiConfig?.darkMode),
      pallette: Number.isFinite(source.uiConfig?.pallette) ? Number(source.uiConfig?.pallette) : 0,
      miscImageSrcNames: source.uiConfig?.miscImageSrcNames ?? {},
    },
    matchData: {
      matchName: typeof source.matchData?.matchName === 'string' ? source.matchData.matchName : 'Trận đấu mới',
      matchVersion: source.matchData?.matchVersion === 23 ? 23 : 24,
      matchPos: Number.isFinite(source.matchData?.matchPos) ? Number(source.matchData?.matchPos) : 0,
      players,
    },
    questionBank: {
      kd: {
        o24Questions: {
          singleplayer,
          multiplayer: asQuestions(importedMultiplayer),
        },
        ...(Array.isArray(bank.kd?.o23Questions) ? { o23Questions: bank.kd.o23Questions.map(asQuestions) } : {}),
      },
      vcnv: {
        questions: asQuestions(bank.vcnv?.questions).slice(0, EDITOR_VCNV_ROW_COUNT),
        cnv: typeof bank.vcnv?.cnv === 'string' ? bank.vcnv.cnv : '',
        cnvMediaSrcNames: Array.isArray(bank.vcnv?.cnvMediaSrcNames)
          ? bank.vcnv.cnvMediaSrcNames.filter((name): name is string => typeof name === 'string')
          : [],
      },
      tt: { questions: asQuestions(bank.tt?.questions) },
      vd: {
        questions: Array.isArray(bank.vd?.questions)
          ? bank.vd.questions.slice(0, EDITOR_PLAYER_COUNT).map(asQuestions)
          : fresh.questionBank.vd.questions,
      },
      chp: { questions: asQuestions(bank.chp?.questions) },
    },
  };
}

function asQuestions(value: unknown): EditorQuestion[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isQuestion).map((question) => ({ ...question }));
}

function isQuestion(value: unknown): value is EditorQuestion {
  return !!value && typeof value === 'object' && typeof (value as EditorQuestion).question === 'string';
}

function isIndexEntry(value: unknown): value is EditorIndexEntry {
  return !!value && typeof value === 'object' && typeof (value as EditorIndexEntry).uid === 'string';
}

function isEditorMediaFolder(value: string): value is EditorRoundKind {
  return (EDITOR_MEDIA_FOLDERS as readonly string[]).includes(value);
}

function safeSegment(value: string): boolean {
  return value !== '' && value !== '.' && value !== '..' && !value.includes('/') && !value.includes('\\');
}

function safeExtension(name: string): string {
  const extension = name.split('.').pop()?.replace(/[^a-z0-9]/gi, '').toLowerCase();
  return extension || 'bin';
}

function safeDownloadName(name: string): string {
  const cleaned = name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/[\x00-\x1F]/g, '')
    .trim();
  return cleaned || 'match';
}

function referencedMedia(document: EditorDocument): Array<[EditorRoundKind, string]> {
  const found = new Set<string>();
  const addQuestion = (kind: EditorRoundKind, question: EditorQuestion): void => {
    if (question.mediaSrcName) found.add(`${kind}/${question.mediaSrcName}`);
    if (question.secondaryMediaSrcName) found.add(`${kind}/${question.secondaryMediaSrcName}`);
  };
  for (const pool of document.questionBank.kd.o24Questions.singleplayer) {
    pool.forEach((question) => addQuestion('kd', question));
  }
  document.questionBank.kd.o24Questions.multiplayer.forEach((question) => addQuestion('kd', question));
  document.questionBank.vcnv.questions.forEach((question) => addQuestion('vcnv', question));
  document.questionBank.vcnv.cnvMediaSrcNames.forEach((name) => found.add(`vcnv/${name}`));
  document.questionBank.tt.questions.forEach((question) => addQuestion('tt', question));
  document.questionBank.vd.questions.flat().forEach((question) => addQuestion('vd', question));
  document.questionBank.chp.questions.forEach((question) => addQuestion('chp', question));
  for (const value of Object.values(document.uiConfig.miscImageSrcNames)) {
    const names = Array.isArray(value) ? value : [value];
    names.filter((name): name is string => typeof name === 'string').forEach((name) => found.add(`misc/${name}`));
  }

  return [...found]
    .map((path) => {
      const [kind, name] = path.split('/', 2);
      return isEditorMediaFolder(kind) && safeSegment(name) ? ([kind, name] as [EditorRoundKind, string]) : null;
    })
    .filter((entry): entry is [EditorRoundKind, string] => entry !== null);
}

function triggerDownload(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
