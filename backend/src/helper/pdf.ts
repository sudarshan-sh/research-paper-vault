import fs from "node:fs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export interface PdfMetadata {
  title: string;
  authors: string[];
  abstract: string;
}

// Only the ICML first-page layout is supported:
//   Title            (biggest text)
//   Author 1 ¹ ² Author 2 ² ...   (bold names, small superscript numbers)
//   Abstract         (own line)
//   abstract text ...
//   1. Introduction  (first numbered heading)

const VOCABULARY_PAGES = 3; // pages read to learn which hyphens are real

// one piece of text on the page with its position
interface Chunk {
  str: string;
  x: number;
  width: number;
  y: number;
  size: number;
}
type Line = Chunk[];

const lineSize = (line: Line) => Math.max(...line.map((c) => c.size));

// gap between two chunks that means a real space
const hasGap = (prev: Chunk | undefined, chunk: Chunk, ratio = 0.15) =>
  !!prev && chunk.x - (prev.x + prev.width) > ratio * chunk.size;

// LaTeX prints "é" as an accent glyph followed by "e", this puts them back together
const ACCENTS: Record<string, string> = {
  "´": "́",
  "`": "̀",
  "^": "̂",
  "¨": "̈",
  "~": "̃",
};
const fixAccents = (text: string) =>
  text
    .replace(
      /([´`^¨~])\s?(\p{L})/gu,
      (_, accent: string, letter: string) => letter + ACCENTS[accent],
    )
    .normalize("NFC");

const lineText = (line: Line) =>
  fixAccents(
    line
      .map((chunk, i) =>
        hasGap(line[i - 1], chunk) ? ` ${chunk.str}` : chunk.str,
      )
      .join(""),
  )
    .replace(/\s+/g, " ")
    .trim();

// chunks on the same baseline form a line (superscripts sit a little higher)
const getLines = async (
  page: Awaited<
    ReturnType<Awaited<ReturnType<typeof getDocument>["promise"]>["getPage"]>
  >,
) => {
  const { items } = await page.getTextContent();
  const lines: Line[] = [];
  let prev: Chunk | undefined;

  for (const item of items) {
    if (!("str" in item) || !item.str.trim()) continue;
    const [, , , d, x, y] = item.transform;
    const chunk: Chunk = {
      str: item.str,
      x,
      width: item.width,
      y,
      size: Math.abs(d),
    };
    if (prev && Math.abs(y - prev.y) < 0.7 * Math.max(chunk.size, prev.size)) {
      lines.at(-1)!.push(chunk);
    } else {
      lines.push([chunk]);
    }
    prev = chunk;
  }
  return lines;
};

// words the paper itself uses, ignoring pieces of words that were split over two lines
const getVocabulary = (texts: string[]) => {
  const words = new Set<string>();
  const compounds = new Set<string>(); // written with a hyphen inside a line: "end-to"

  texts.forEach((text, i) => {
    const found = text.match(/\p{L}+(?:-\p{L}+)*/gu) ?? [];
    found.forEach((word, n) => {
      const isSplitPiece =
        (n === 0 && texts[i - 1]?.endsWith("-")) ||
        (n === found.length - 1 && text.endsWith("-"));
      if (isSplitPiece) return;

      const parts = word.toLowerCase().split("-");
      parts.forEach((part) => words.add(part));
      if (parts.length > 1) compounds.add(parts.join("-"));
    });
  });
  return { words, compounds };
};

// joins wrapped lines. A hyphen at the end of a line is a word break ("learn-" + "ing") unless the
// word is a compound: the paper writes it with a hyphen elsewhere, or "leftright" is not a word in
// the paper while "right" is ("gradient-" + "based")
const joinLines = (
  texts: string[],
  vocabulary: ReturnType<typeof getVocabulary>,
) =>
  texts.reduce((all, text) => {
    const left = all.match(/(\p{L}+)-$/u)?.[1]?.toLowerCase();
    const right = text.match(/^\p{L}+/u)?.[0].toLowerCase();
    if (!left || !right) return `${all} ${text}`.trim();

    const { words, compounds } = vocabulary;
    const keepHyphen =
      compounds.has(`${left}-${right}`) ||
      (right.length >= 4 && !words.has(left + right) && words.has(right));
    return (keepHyphen ? all : all.slice(0, -1)) + text;
  }, "");

// names are separated by the superscripts that follow them (and by wide gaps)
const getAuthors = (line: Line) => {
  const size = lineSize(line);
  const names: string[] = [];
  let name = "";

  line.forEach((chunk, i) => {
    const prev = line[i - 1];
    const isSuperscript = chunk.size < 0.8 * size;
    if (isSuperscript || hasGap(prev, chunk, 1)) {
      names.push(name);
      name = "";
    }
    if (!isSuperscript)
      name += (hasGap(prev, chunk) && name ? " " : "") + chunk.str;
  });
  names.push(name);

  return names
    .map((n) =>
      fixAccents(n)
        .replace(/[^\p{L}\p{M}'’. -]/gu, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter(Boolean);
};

export const extractPdfMetadata = async (
  filePath: string,
  fallbackTitle: string,
): Promise<PdfMetadata> => {
  const loadingTask = getDocument({
    data: new Uint8Array(await fs.promises.readFile(filePath)),
    isEvalSupported: false, // uploaded PDFs are untrusted
    verbosity: 0,
  });

  try {
    const doc = await loadingTask.promise;
    const pages = await Promise.all(
      Array.from(
        { length: Math.min(doc.numPages, VOCABULARY_PAGES) },
        async (_, i) => getLines(await doc.getPage(i + 1)),
      ),
    );
    const lines = pages[0]!;
    const texts = lines.map(lineText);
    const vocabulary = getVocabulary(pages.flat().map(lineText));

    const abstractAt = texts.findIndex((t) => /^abstract$/i.test(t));
    if (abstractAt < 0) {
      return { title: fallbackTitle, authors: ["Unknown"], abstract: "" };
    }

    // title: the biggest lines above "Abstract", authors: the lines between the title and "Abstract"
    const header = lines.slice(0, abstractAt);
    const titleSize = Math.max(...header.map(lineSize));
    const titleLines = header.filter(
      (line) => lineSize(line) >= 0.9 * titleSize,
    );
    const authorLines = header.slice(
      header.lastIndexOf(titleLines.at(-1)!) + 1,
    );

    const introAt = texts.findIndex(
      (t, i) => i > abstractAt && /^\d+\.\s*\p{Lu}/u.test(t),
    );
    const abstractTexts = texts.slice(
      abstractAt + 1,
      introAt < 0 ? undefined : introAt,
    );

    const authors = authorLines.flatMap(getAuthors);
    return {
      title: joinLines(titleLines.map(lineText), vocabulary) || fallbackTitle,
      authors: authors.length > 0 ? authors : ["Unknown"],
      abstract: joinLines(abstractTexts, vocabulary),
    };
  } catch (error) {
    console.error("Error reading PDF metadata:", error);
    return { title: fallbackTitle, authors: ["Unknown"], abstract: "" };
  } finally {
    await loadingTask.destroy();
  }
};
