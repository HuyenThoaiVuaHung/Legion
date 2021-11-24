
export interface KDQuestion {
    id: number,
    question: string,
    answer: string,
}

export interface VCNVQuestion {
    id: number,
    question: string,
    answer: string,
    type: "HN" | "HN_S" | "CNV",
    value: number,
}