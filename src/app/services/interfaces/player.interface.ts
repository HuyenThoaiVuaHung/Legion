export interface Player {
    id: number,
    name: string,
    score: number,
    answerVCNV?: string,
    answerTT?: string,
    ifFirstAnswer?: boolean,
    ifNSHV?: boolean,
}