import type { LibraryItem } from "../../types";

export const sherlockAdventures: LibraryItem = {
    id: "builtin-sherlock-adventures",
    sourceType: "builtin",
    title: "The Adventures of Sherlock Holmes",
    author: "Arthur Conan Doyle",
    description: "The famous consulting detective and his friend Dr. Watson solving mysteries in Victorian London.",
    coverColor: "#a8a29e", // Stone/Vintage
    createdAt: 0,
    updatedAt: 0,
    chapters: [
        {
            id: "scandal",
            title: "A Scandal in Bohemia",
            paragraphs: [
                "To Sherlock Holmes she is always THE woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex. It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.",
                "He was, I take it, the most perfect reasoning and observing machine that the world has seen, but as a lover he would have placed himself in a false position. He never spoke of the softer passions, save with a gibe and a sneer. They were admirable things for the observer—excellent for drawing the veil from men’s motives and actions. But for the trained reasoner to admit such intrusions into his own delicate and finely adjusted temperament was to introduce a distracting factor which might throw a doubt upon all his mental results.",
                "Grit in a sensitive instrument, or a crack in one of his own high-power lenses, would not be more disturbing than a strong emotion in a nature such as his. And yet there was but one woman to him, and that woman was the late Irene Adler, of dubious and questionable memory."
            ],
        },
        {
            id: "league",
            title: "The Red-Headed League",
            paragraphs: [
                "I had called upon my friend, Mr. Sherlock Holmes, one day in the autumn of last year and found him in deep conversation with a very stout, florid-faced, elderly gentleman with fiery red hair. With an apology for my intrusion, I was about to withdraw when Holmes pulled me abruptly into the room and closed the door behind me.",
                "“You could not possibly have come at a better time, my dear Watson,” he said cordially.",
                "“I was afraid that you were engaged.”",
                "“So I am. Very much so.”"
            ],
        }
    ],
};
