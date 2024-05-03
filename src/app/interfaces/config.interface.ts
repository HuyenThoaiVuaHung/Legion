export interface IInterfaceConfig {
  darkMode: boolean;
  pallette: Pallette;
  miscImageSrcNames: IMiscMedia
  miscImageSrc?: IMiscMedia
}
export interface IMiscMedia {
  'logo-long'?: string
  'logo'?: string
  'placeholder'?: string
  'background'?: string
  players?: string[]
}
export enum Pallette {
  RED,
  GREEN,
  BLUE,
  YELLOW,
  CYAN,
  MAGENTA,
  ORANGE,
  CHARTREUSE,
  AZURE,
  VIOLET,
  ROSE
}
