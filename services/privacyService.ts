import nlp from 'compromise';

/**
 * THE PRIVACY SHIELD
 * 
 * This service runs entirely in the browser. It intercepts prompts BEFORE
 * they are sent to the AI API.
 * 
 * It uses a multi-layered approach:
 * 1. Strict Regex Pattern Matching (Emails, Phones, Credit Cards, Keys)
 * 2. NLP Named Entity Recognition via 'compromise' library (Person Names)
 */

interface RedactionResult {
    cleanedText: string;
    wasRedacted: boolean;
    redactionMap: Record<string, string>; // Maps placeholder -> original
}

// Patterns for PII
const PATTERNS = {
    // Basic Email Regex
    EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    // Flexible Phone Number (US/Intl)
    PHONE: /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
    // Simple Credit Card (16 digits with separators)
    CREDIT_CARD: /\b(?:\d{4}[ -]?){3}\d{4}\b/g,
    // Social Security Number (US)
    SSN: /\b\d{3}-\d{2}-\d{4}\b/g,
    // API Keys (Matches typical sk- and AIza patterns for security)
    API_KEY: /(?:sk-|AIza)[a-zA-Z0-9_\-]{30,}/g 
};

export const redactPII = (text: string): RedactionResult => {
    let currentText = text;
    let wasRedacted = false;
    const redactionMap: Record<string, string> = {};

    // Helper to replace and store
    const replace = (regex: RegExp, type: string) => {
        currentText = currentText.replace(regex, (match) => {
            wasRedacted = true;
            // Use random ID to prevent collisions and improve security look
            const id = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            const placeholder = `[REDACTED_${type}_${id}]`;
            redactionMap[placeholder] = match;
            return placeholder;
        });
    };

    // --- Layer 1: Strict Patterns ---
    // Order matches important patterns first to avoid partial replacements
    replace(PATTERNS.API_KEY, 'API_KEY');
    replace(PATTERNS.EMAIL, 'EMAIL');
    replace(PATTERNS.CREDIT_CARD, 'CC');
    replace(PATTERNS.SSN, 'SSN');
    replace(PATTERNS.PHONE, 'PHONE'); 

    // --- Layer 2: NLP Name Detection ---
    // We pass the partially redacted text to compromise.
    // Compromise is lightweight and runs in-browser.
    try {
        const doc = nlp(currentText);
        
        // Extract people's names
        // We explicitly cast to unknown then string[] to satisfy TS with CDN imports
        const peopleList = doc.people().out('array') as unknown as string[];
        
        // Sort by length descending to handle full names before partial names
        // e.g. "John Doe" before "John"
        const uniquePeople = [...new Set(peopleList)].sort((a, b) => b.length - a.length);

        uniquePeople.forEach((name: string) => {
            // Safety checks:
            // 1. Don't redact our own placeholders (starts with [REDACTED)
            // 2. Ignore very short names (2 chars or less) to avoid false positives on initials or common words
            if (!name.startsWith('[REDACTED') && name.length > 2) {
                
                // Escape regex special characters in the name to prevent errors
                const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                
                // Match whole words only, case insensitive
                const nameRegex = new RegExp(`\\b${escapedName}\\b`, 'gi');
                
                if (nameRegex.test(currentText)) {
                    replace(nameRegex, 'NAME');
                }
            }
        });
    } catch (e) {
        console.warn("Aegis Privacy Shield: NLP module encountered a hiccup, falling back to strict patterns only.", e);
    }

    return {
        cleanedText: currentText,
        wasRedacted,
        redactionMap
    };
};