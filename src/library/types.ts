export type LibrarySourceType = "builtin" | "paste" | "local" | "gdrive" | "dropbox";

export type LibraryChapter = {
    id: string;
    title: string;
    paragraphs: string[];
};

export type LibraryItem = {
    id: string;
    sourceType: LibrarySourceType;
    title: string;
    author?: string;
    createdAt: number;
    updatedAt: number;
    description?: string; // Helpful for cards
    coverColor?: string; // UI polish
    chapters: LibraryChapter[];

    // Progress (local only, usually stored separately but defined here for context)
    progress?: {
        chapterIndex: number;
        paragraphIndex: number;
    };
};
