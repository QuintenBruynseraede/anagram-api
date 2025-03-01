from dataclasses import dataclass
from collections import Counter
from pathlib import Path


@dataclass
class Query:
    word: str
    counter: Counter[str]

    def __init__(self, word: str):
        self.word = word
        self.counter = Counter(word.lower().replace(" ", "").strip())


@dataclass
class Word:
    counter: Counter[str]
    word: str

    @property
    def length(self) -> int:
        return len(self.word)


@dataclass
class Inputs:
    words: list[Word]
    nouns: list[Word]
    adjectives: list[Word]
    names: list[Word]

    @staticmethod
    def from_files(dir: Path) -> "Inputs":
        words = sorted(
            [
                Word(counter=Counter(word.lower()), word=word.lower())
                for word in (dir / "words.txt").read_text().splitlines()
                if len(word) >= 3
            ],
            key=lambda x: -x.length,
        )
        nouns = [
            Word(counter=Counter(word.lower()), word=word.lower())
            for word in (dir / "nouns.txt").read_text().splitlines()
        ]
        adjectives = [
            Word(counter=Counter(word.lower()), word=word.lower())
            for word in (dir / "adjectives.txt").read_text().splitlines()
        ]
        names = [
            Word(counter=Counter(word.lower()), word=word.lower())
            for word in (dir / "names.txt").read_text().splitlines()
        ]
        return Inputs(words=words, nouns=nouns, adjectives=adjectives, names=names)
