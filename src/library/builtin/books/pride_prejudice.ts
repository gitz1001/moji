import type { LibraryItem } from "../../types";

export const pridePrejudice: LibraryItem = {
    id: "builtin-pride-prejudice",
    sourceType: "builtin",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description: "A romantic novel of manners, following the turbulent relationship between Elizabeth Bennet and Fitzwilliam Darcy.",
    coverColor: "#f472b6", // Pinkish
    createdAt: 0,
    updatedAt: 0,
    chapters: [
        {
            id: "ch1",
            title: "Chapter 1",
            paragraphs: [
                "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
                "However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.",
                "“My dear Mr. Bennet,” said his lady to him one day, “have you heard that Netherfield Park is let at last?”",
                "Mr. Bennet replied that he had not.",
                "“But it is,” returned she; “for Mrs. Long has just been here, and she told me all about it.”",
                "Mr. Bennet made no answer."
            ],
        },
        {
            id: "ch2",
            title: "Chapter 2",
            paragraphs: [
                "Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it. It was then disclosed in the following manner.",
                "Observing his second daughter employed in trimming a hat, he suddenly addressed her with:",
                "“I hope Mr. Bingley will like it, Lizzy.”",
                "“We are not in a way to know what Mr. Bingley likes,” said her mother resentfully, “since we are not to visit.”"
            ],
        }
    ],
};
