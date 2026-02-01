/** Text Generator — Common English Words */

// ~200 most common English words for typing practice
const COMMON_WORDS = [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
    'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
    'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
    'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
    'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
    'is', 'was', 'are', 'been', 'has', 'had', 'did', 'does', 'being', 'were',
    'made', 'find', 'long', 'here', 'thing', 'own', 'much', 'those', 'tell', 'very',
    'still', 'last', 'must', 'before', 'great', 'through', 'mean', 'keep', 'let', 'begin',
    'seem', 'help', 'every', 'show', 'always', 'home', 'should', 'never', 'small', 'end',
    'found', 'thought', 'went', 'both', 'few', 'same', 'another', 'while', 'ask', 'too',
    'world', 'high', 'need', 'right', 'hand', 'part', 'place', 'old', 'live', 'leave',
    'put', 'read', 'point', 'change', 'off', 'play', 'move', 'try', 'kind', 'between',
    'head', 'turn', 'start', 'might', 'story', 'city', 'under', 'without', 'again', 'run',
    'may', 'shall', 'such', 'give', 'just', 'around', 'each', 'near', 'learn', 'feel',
    'late', 'hard', 'write', 'light', 'word', 'money', 'letter', 'mother', 'father', 'young'
];

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Generate a list of random words for typing test
 * @param count Number of words to generate (default 80)
 */
export function generateWords(count: number = 80): string[] {
    // Shuffle and take required count, repeating if necessary
    const shuffled = shuffle(COMMON_WORDS);
    const words: string[] = [];

    while (words.length < count) {
        const remaining = count - words.length;
        words.push(...shuffled.slice(0, Math.min(remaining, shuffled.length)));
    }

    return words;
}
