// Sentences the chapters and the tests share (kept apart from content.ts so the chapter modules
// never import the module that imports them).

/** The sentence every listing of the kit must carry (RESEARCH.md §5): what the reader still needs. */
export const NEEDS_LINE =
  'You still need a Claude subscription, a terminal and your own judgement: this book shows how one operation runs, not a button that runs one for you.';

/** The marker the manuscript carried until the listing-pack item (2026-11-05); the test now asserts it is gone. */
export const OWNER_PROCESS_PLACEHOLDER =
  '[What the owner did before publishing — to be stated by the owner at publication: edited, cut and verified; or read and published as drafted.]';

/**
 * The owner's part, stated as the publication rule the owner request (action 038) makes binding: the book is
 * uploaded only after the owner has read it against the review checklist, and nothing is changed after that read
 * except what the owner asks. If the owner chooses not to read it, it stays unpublished (the request says so).
 */
export const OWNER_PROCESS_LINE =
  'The owner of the operation publishes this book only after reading it against the review checklist the routine wrote for it, chapter by chapter, with the claims a reader would rely on marked for checking. Whatever they chose to change is in the text you are reading, and nothing was altered after their read. If this book is on sale, that read happened.';
