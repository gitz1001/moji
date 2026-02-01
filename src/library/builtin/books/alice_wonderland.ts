import type { LibraryItem } from "../../types";

export const aliceWonderland: LibraryItem = {
    id: "builtin-alice-wonderland",
    sourceType: "builtin",
    title: "Alice’s Adventures in Wonderland",
    author: "Lewis Carroll",
    description: "Down the rabbit-hole into a fantasy world of anthropomorphic creatures.",
    coverColor: "#60a5fa", // Blue ish
    createdAt: 0,
    updatedAt: 0,
    chapters: [
        {
            id: "ch1",
            title: "Chapter 1 — Down the Rabbit-Hole",
            paragraphs: [
                "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice “without pictures or conversations?”",
                "So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.",
                "There was nothing so VERY remarkable in that; nor did Alice think it so VERY much out of the way to hear the Rabbit say to itself, “Oh dear! Oh dear! I shall be too late!” (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually TOOK A WATCH OUT OF ITS WAISTCOAT-POCKET, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge."
            ],
        },
        {
            id: "ch2",
            title: "Chapter 2 — The Pool of Tears",
            paragraphs: [
                "“Curiouser and curiouser!” cried Alice (she was so much surprised, that for the moment she quite forgot how to speak good English); “now I’m opening out like the largest telescope that ever was! Good-bye, feet!” (for when she looked down at her feet, they seemed to be almost out of sight, they were getting so far off).",
                "“Oh, my poor little feet, I wonder who will put on your shoes and stockings for you now, dears? I’m sure I shan’t be able! I shall be a great deal too far off to trouble myself about you: you must manage the best way you can; —but I must be kind to them,” thought Alice, “or perhaps they won’t walk the way I want to go! Let me see: I’ll give them a new pair of boots every Christmas.”"
            ],
        }
    ],
};
