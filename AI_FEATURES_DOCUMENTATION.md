# AI Features Documentation

This document describes the AI-powered features that were originally implemented but later removed from the Rizal book application. These features can be revisited and re-implemented in the future if needed.

## Overview

The AI features were designed to enhance the reading experience by providing intelligent search capabilities and interactive chat functionality, all while maintaining strict adherence to the book's content.

## Features

### 1. AI-Powered Chat

**Description:** A chat interface that allows users to ask questions about Jose Rizal's life, works, and historical context. The AI would provide answers strictly based on the book's content.

**Key Features:**
- Book-only responses (no external knowledge)
- Chapter citations with clickable links
- Conversation history (maintains context across questions)
- Non-disruptive UI (doesn't interrupt reading flow)

**Implementation Details:**
- Used Gemini API for natural language processing
- System prompt enforced strict book-only responses
- Conversation history limited to last 10 exchanges for context management
- Temperature set to 0.3 for consistent, factual responses
- Max output tokens: 1000

**User Experience:**
- User clicks "Chat" button to open chat modal
- Types question in input field
- AI responds with answer and chapter citations
- User can click citations to jump to relevant chapters
- Chat modal can be closed without losing reading position

**Code Structure:**
```javascript
// Chat state management
let chatHistory = [];
let chatMessagePassages = {};
let chatMessageCounter = 0;

// Main chat function
async function sendChatMessage() {
  // 1. Get user input
  // 2. Build book context (all chapters)
  // 3. Create system prompt with strict rules
  // 4. Call Gemini API
  // 5. Parse response and extract citations
  // 6. Display response with clickable citations
}
```

### 2. AI Source Highlighting

**Description:** When the AI provides an answer, users can click "Show in Book" to highlight the exact passages in the book that the AI used as sources.

**Key Features:**
- Highlights appear with pulsing animation
- Non-disruptive (doesn't auto-scroll)
- Individual highlight dismissal
- Bulk dismiss option
- Visual indicator when highlights are active

**Implementation Details:**
- AI returns `sourcePassages` JSON array with exact quotes
- JavaScript finds text in DOM using TreeWalker
- Creates `<mark>` elements with special styling
- Stores highlights in array for management
- CSS animation for visual feedback

**User Experience:**
- User asks AI a question
- AI responds with answer and "Show in Book" button
- User clicks button
- Relevant passages highlighted in book
- Indicator appears in bottom-left corner
- User can dismiss highlights or view them
- Clicking a highlight removes it

**Code Structure:**
```javascript
// Highlight management
let aiHighlightElements = [];

function showSourceInBook(messageId) {
  // 1. Get passages from chatMessagePassages
  // 2. Clear previous highlights
  // 3. For each passage:
  //    - Find section by chapterId
  //    - Use TreeWalker to find text node
  //    - Create range and surround with <mark>
  // 4. Show indicator panel
}

function dismissAIHighlights() {
  // Remove all highlight marks from DOM
  // Clear aiHighlightElements array
  // Hide indicator
}
```

### 3. AI-Powered Search

**Description:** Enhanced search functionality that uses AI to understand natural language queries and provide intelligent answers with chapter references.

**Key Features:**
- Natural language query understanding
- AI-generated answers with context
- Relevant chapter suggestions
- Fallback to keyword search if AI fails

**Implementation Details:**
- Toggle between "Keyword" and "AI" search modes
- AI mode sends query + book excerpts to Gemini
- Requests JSON response with answer and chapters
- Parses and displays results
- 5-second timeout for API calls

**User Experience:**
- User types query in search box
- Selects "AI" mode
- AI responds with answer and relevant chapters
- User can click chapters to navigate
- If AI fails, shows error message

**Code Structure:**
```javascript
async function performAISearch(query, apiKey) {
  // 1. Build chapters text (first 2000 chars each)
  // 2. Create prompt asking for JSON response
  // 3. Call Gemini API
  // 4. Parse JSON response
  // 5. Display answer and chapter links
}
```

## API Configuration

**Service:** Google Gemini API
**Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
**Authentication:** API key stored in localStorage
**Model:** gemini-pro
**Parameters:**
- Temperature: 0.1-0.3 (for factual consistency)
- Max output tokens: 500-1000

## System Prompts

### Chat System Prompt
```
You are a helpful assistant that answers questions about Jose Rizal based ONLY on the book content provided below.

CRITICAL RULES:
1. You must ONLY use information from the book content provided
2. If the answer is not in the book, say "I don't have information about that in this book"
3. Always cite which chapter(s) your answer comes from
4. Do not use any external knowledge or make assumptions
5. Be concise but thorough
6. Format your response clearly with chapter citations at the end
7. At the end of your response, include a JSON array called "sourcePassages" with exact quotes from the book that you used. Format: [{"chapterId": "ch1", "text": "exact quote from the book"}]

BOOK CONTENT:
[Full book content inserted here]

Respond to the user's question using ONLY the information from the book above. Include the sourcePassages JSON at the end.
```

### Search System Prompt
```
You are helping a reader find information in a book about Jose Rizal. Question: "[user query]"

Based on the book content below, identify which chapters contain relevant information and provide a brief answer. Format your response as JSON with "answer" (string) and "chapters" (array of chapter titles).

[Book excerpts inserted here]
```

## Technical Challenges Encountered

### 1. Quote Escaping in Dynamic HTML
**Problem:** Dynamically generated onclick handlers with string parameters had quote escaping issues.
**Attempted Solutions:**
- Backslash escaping: `\'`
- HTML entities: `&apos;`, `&#39;`
- Template literals
**Result:** None worked reliably across all browsers and contexts.

### 2. Context Window Limitations
**Problem:** Full book content (~540KB) exceeds Gemini's context window.
**Solution:** 
- For chat: Send full book content (works but slow)
- For search: Send first 2000 chars of each chapter
**Trade-off:** Chat is more accurate but slower; search is faster but may miss details.

### 3. Source Passage Extraction
**Problem:** AI doesn't always return exact quotes that can be found in the DOM.
**Solution:** Request `sourcePassages` JSON with exact quotes.
**Challenge:** AI sometimes paraphrases or the quotes don't match exactly due to whitespace/formatting.

### 4. Highlight Position Tracking
**Problem:** Text nodes can be split across multiple DOM nodes.
**Solution:** Use TreeWalker to traverse all text nodes and calculate cumulative offsets.
**Complexity:** Requires careful offset calculation and range management.

## Future Improvements

If these features are re-implemented, consider:

1. **Better Quote Escaping:** Use event listeners instead of inline onclick handlers
   ```javascript
   button.addEventListener('click', () => showSourceInBook(messageId));
   ```

2. **Chunked Book Content:** Split book into smaller chunks for API calls
   - Reduces token usage
   - Faster responses
   - Can search specific sections

3. **Caching:** Cache AI responses to reduce API calls
   - Store in localStorage
   - Key by question hash
   - Expire after 24 hours

4. **Fallback Strategies:** 
   - If AI fails, fall back to keyword search
   - If exact quotes not found, highlight nearest matches
   - Show confidence score for AI responses

5. **Offline Support:**
   - Use smaller language model that runs in browser
   - Pre-compute embeddings for chapters
   - Vector similarity search for semantic queries

6. **Better Source Tracking:**
   - Require AI to return character offsets
   - Store passage locations in metadata
   - Direct navigation without text search

## Re-implementation Checklist

To add these features back:

- [ ] Add Chat button to header
- [ ] Create chat modal HTML
- [ ] Add chat-related CSS styles
- [ ] Implement `sendChatMessage()` function
- [ ] Implement `showSourceInBook()` function
- [ ] Add AI highlight indicator panel
- [ ] Add Settings button and modal for API key
- [ ] Add search mode toggle (Keyword/AI)
- [ ] Implement `performAISearch()` function
- [ ] Test quote escaping in all onclick handlers
- [ ] Add error handling for API failures
- [ ] Implement conversation history management
- [ ] Add loading states and user feedback
- [ ] Test with various query types
- [ ] Optimize book context size for API calls

## Conclusion

The AI features provided a rich, interactive reading experience but faced technical challenges with quote escaping and context management. The core functionality worked well, but the implementation complexity and edge cases made it difficult to maintain reliability. 

The features can be revisited in the future with improvements to:
- Event handling (avoid inline onclick)
- Context management (chunked content)
- Caching strategies
- Fallback mechanisms
- Error handling

The foundation code is preserved in git history and can be used as a reference for future implementations.
