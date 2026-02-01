import type { LibraryItem } from "../types";
import { sherlockAdventures } from "./books/sherlock_adventures";
import { aliceWonderland } from "./books/alice_wonderland";
import { pridePrejudice } from "./books/pride_prejudice";

export const BUILTIN_LIBRARY: LibraryItem[] = [
    sherlockAdventures,
    aliceWonderland,
    pridePrejudice,
];
