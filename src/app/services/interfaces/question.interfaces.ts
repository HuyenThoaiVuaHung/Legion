

export interface VCNVQuestion {
    id: number,
    question: string,
    answer: string,
    type: "HN" | "HN_S" | "CNV",
    value: number,
    state?: 'Yes' | 'No' | 'Pending',
}
