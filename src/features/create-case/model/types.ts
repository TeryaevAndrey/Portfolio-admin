import type { Case } from "@/entities/case";

export interface CreateCaseParams {
    images: File[];
    title: string;
    description?: string;
    link?: string;
}

export type CreateCaseResponse = Case;