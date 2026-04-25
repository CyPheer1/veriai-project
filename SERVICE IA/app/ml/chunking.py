import re
from typing import Iterable

import nltk
import spacy
from nltk.tokenize import sent_tokenize

_WORD_RE = re.compile(r"[A-Za-z0-9']+")

_nlp = spacy.blank("en")
if "sentencizer" not in _nlp.pipe_names:
    _nlp.add_pipe("sentencizer")


def _ensure_nltk() -> None:
    try:
        sent_tokenize("Quick test.")
    except LookupError:
        nltk.download("punkt", quiet=True)


_ensure_nltk()


def count_words(text: str) -> int:
    return len(_WORD_RE.findall(text))


def _split_sentences(paragraph: str) -> list[str]:
    paragraph = paragraph.strip()
    if not paragraph:
        return []

    doc = _nlp(paragraph)
    sentences = [sent.text.strip() for sent in doc.sents if sent.text.strip()]
    if sentences:
        return sentences

    return [s.strip() for s in sent_tokenize(paragraph) if s.strip()]


def _iter_paragraph_sentences(text: str) -> Iterable[str]:
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    for paragraph in paragraphs:
        for sentence in _split_sentences(paragraph):
            yield sentence


def semantic_chunk_text(
    text: str,
    min_words: int = 120,
    max_words: int = 512,
    min_process_words: int = 50,
) -> list[str]:
    if not text or not text.strip():
        return []

    chunks: list[str] = []
    current_sentences: list[str] = []
    current_words = 0

    def flush_current() -> None:
        nonlocal current_sentences, current_words
        if not current_sentences:
            return
        chunk_text = " ".join(current_sentences).strip()
        if chunk_text:
            chunks.append(chunk_text)
        current_sentences = []
        current_words = 0

    for sentence in _iter_paragraph_sentences(text):
        sentence_words = count_words(sentence)
        if sentence_words == 0:
            continue

        if current_words > 0 and current_words + sentence_words > max_words and current_words >= min_words:
            flush_current()

        current_sentences.append(sentence)
        current_words += sentence_words

        if current_words >= max_words:
            flush_current()

    if current_sentences:
        if current_words < min_words and chunks:
            chunks[-1] = (chunks[-1] + " " + " ".join(current_sentences)).strip()
        else:
            flush_current()

    if not chunks:
        chunks = [text.strip()]

    # Guarantee processable chunks by merging trailing short chunks.
    normalized_chunks: list[str] = []
    for chunk in chunks:
        if count_words(chunk) < min_process_words and normalized_chunks:
            normalized_chunks[-1] = (normalized_chunks[-1] + " " + chunk).strip()
        else:
            normalized_chunks.append(chunk.strip())

    if normalized_chunks and count_words(normalized_chunks[0]) < min_process_words and len(normalized_chunks) > 1:
        normalized_chunks[1] = (normalized_chunks[0] + " " + normalized_chunks[1]).strip()
        normalized_chunks = normalized_chunks[1:]

    return [chunk for chunk in normalized_chunks if chunk]
