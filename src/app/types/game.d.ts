export interface VcnvData {
    questions:       Question[];
    playerAnswers:   PlayerAnswer[];
    showResults:     boolean;
    disabledPlayers: number[];
    noOfOpenRows:    number;
    CNVPlayers:      CNVPlayer[];
}

export interface PlayerAnswer {
    answer:  string;
    correct: boolean;
}

export interface Question {
    id:             number;
    type:           string;
    value:          number;
    ifOpen:         boolean;
    ifShown:       boolean;
    question:       string;
    answer:         string;
    audioFilePath?: string;
    picFileName?:   string;
}

export interface CNVPlayer {
    id: number;
    timestamp: number;
    readableTime: string;
}