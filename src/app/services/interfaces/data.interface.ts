import { Player } from "./player.interface";
import { VCNVQuestion } from "./question.interfaces";

export interface VCNVData { 
    questions: VCNVQuestion[],
    
}
export interface MatchData {
    socketId: string, // String phòng của SocketIO (eg: ohtvh4bk1), để gia nhập phòng
    matchName: string, // Tên trận đấu (eg: Bán Kết 1 - HTVH IV)
    matchPos: 'H' | 'VCNV' | 'TT' | 'KD' | 'VD', // Vị trí trận đấu (VCNV, TT, KD, VD)
    players: Player[], // Danh sách các người chơi trong trận đấu
    KDFilePath: string, // Đường dẫn đến file KD
}
export interface KhoiDong {
    questions: [
        {
            question: string,
            answer: string,
            type: 'A' | 'N' | 'P',
            audioFilePath?: string,
        }
    ],
    currentQuestionId: number,
    currentRelativeQuestion: number,
    currentAccurateQuestion: number,
    currentPlayer: number,
    currentTime: number,
}
export interface VCNV {
    questions: VCNVQuestion[],
    currentQuestionId: number,
    questionPicturePath: string,
    playerAnswers: [{
        playerId: number,
        answer: string,
        correct: boolean,
    }],
    currentTime: number,
}
