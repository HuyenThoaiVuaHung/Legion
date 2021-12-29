export interface Player {
    id: number,
    name: string,
    score: number,
    isReady: boolean,
}
/*
    players: [
        0: {
            id: 1,
            name: "Nguyễn Văn A",
            score: 0,
        },
        1: {
            id: 2,
            name: "Nguyễn Văn B",
            score: 0,
        },
    ]
*/

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
            type: 'A' | 'N',
            audioFilePath?: string,
        }
    ],
    currentQuestionId: number,
    currentRelativeQuestion: number,
    currentAccurateQuestion: number,
    currentPlayer: number,
    currentTime: number,
}