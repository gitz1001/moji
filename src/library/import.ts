import { v4 as uuidv4 } from 'uuid';
import type { LibraryItem, LibraryChapter } from './types';

/**
 * Splits raw text into paragraphs and chapters.
 * Simple algorithm:
 * - Split by double newline for paragraphs.
 * - Group every N paragraphs into a "Chapter" (chunking).
 */
export function createFromText(title: string, text: string, sourceType: LibraryItem['sourceType'] = 'paste'): LibraryItem {
    // 1. Clean Text
    const cleanText = text.replace(/\r\n/g, '\n').trim();

    // 2. Split Paragraphs (Double newline usually)
    let paragraphs = cleanText
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

    // If no double newlines, try single newlines if paragraphs are long?
    // For now, stick to double/chunks. If array is length 1 and long, maybe split by sentences?
    // Keeping it simple for MVP.

    // 3. Chunk into Chapters (e.g. 20 paragraphs per 'Chapter' if no explicit structure)
    const CHUNK_SIZE = 20;
    const chapters: LibraryChapter[] = [];

    for (let i = 0; i < paragraphs.length; i += CHUNK_SIZE) {
        const chunk = paragraphs.slice(i, i + CHUNK_SIZE);
        chapters.push({
            id: uuidv4(),
            title: `Part ${chapters.length + 1}`,
            paragraphs: chunk
        });
    }

    // 4. Create Item
    return {
        id: `user-${uuidv4()}`,
        sourceType,
        title: title || 'Untitled',
        author: 'User Imported',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        // Assign a random cover color
        coverColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][Math.floor(Math.random() * 5)],
        chapters
    };
}

import * as pdfjsLib from 'pdfjs-dist';

// Set worker to CDN for simplicity in this environment
// In a refined production build, we might bundle the worker.
const pdfjsVersion = pdfjsLib.version;
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;

export async function parsePdf(file: File): Promise<LibraryItem> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';

    // Limit pages to avoid freezing on massive books for MVP
    const MAX_PAGES = 50;
    const numPages = Math.min(pdf.numPages, MAX_PAGES);

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const tokenizedText = await page.getTextContent();
        const pageText = tokenizedText.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
    }

    if (pdf.numPages > MAX_PAGES) {
        fullText += `\n\n[Import stopped after ${MAX_PAGES} pages for performance]`;
    }

    const title = file.name.replace(/\.pdf$/i, '');
    return createFromText(title, fullText, 'local'); // reuse createFromText for chunking
}

export async function parseFile(file: File): Promise<LibraryItem> {
    // PDF Handler
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        return parsePdf(file);
    }

    // Text/MD Handler
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) return reject("Empty file");

            // Basic title from filename
            const title = file.name.replace(/\.(txt|md|docx)$/i, '');
            const item = createFromText(title, text, 'local');
            resolve(item);
        };

        reader.onerror = () => reject("Failed to read file");

        reader.readAsText(file);
    });
}
