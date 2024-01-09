export interface MatchData {
    matchName: string;
    matchPos: string;
    players: Player[];

}
export interface Player {
    id: number;
    name: string;
    score: number;
    isReady: boolean;
}
