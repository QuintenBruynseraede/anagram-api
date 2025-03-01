from asyncio import sleep
from typing import AsyncGenerator, Protocol
from collections import Counter

from backend.anagram_finder.input import Inputs, Query


class AnagramAlgorithm(Protocol):
    async def find(self, inputs: Inputs, query: Query) -> AsyncGenerator[str]: ...


class MockAlgorithm(AnagramAlgorithm):
    async def find(self, inputs: Inputs, query: Query) -> AsyncGenerator[str]:
        for i in range(10):
            yield f"mock{i}"
            await sleep(1)


# ----------------------- Method 1: find list of words in dictionary


class RecursiveAlgorithm(AnagramAlgorithm):
    async def find(self, inputs: Inputs, query: Query) -> AsyncGenerator[str]:
        async def _find(
            remainder: Counter[str], words: list[str]
        ) -> AsyncGenerator[str]:
            if not remainder:
                yield " ".join(words).lower()
                return

            if len(words) == 3:
                return

            for word in inputs.words:
                if not word.counter - remainder:
                    async for result in _find(
                        remainder - word.counter, words + [word.word]
                    ):
                        yield result

        async for x in _find(query.counter, []):
            yield x


class AdjectiveNounAlgorithm(AnagramAlgorithm):
    async def find(self, inputs: Inputs, query: Query) -> AsyncGenerator[str]:
        for adjective in inputs.adjectives:
            if not adjective.counter - query.counter:
                remainder = query.counter - adjective.counter
                for noun in inputs.nouns:
                    if not noun.counter - remainder:
                        if not remainder - noun.counter:
                            yield f"{adjective.word} {noun.word}"
                            continue


class AdjectiveNameAlgorithm(AnagramAlgorithm):
    async def find(self, inputs: Inputs, query: Query) -> AsyncGenerator[str]:
        for adjective in inputs.adjectives:
            if not adjective.counter - query.counter:
                remainder = query.counter - adjective.counter
                for name in inputs.names:
                    if not name.counter - remainder:
                        if not remainder - name.counter:
                            yield f"{adjective.word} {name.word}"
                            continue


class NameNounAlgorithm(AnagramAlgorithm):
    async def find(self, inputs: Inputs, query: Query) -> AsyncGenerator[str]:
        for name in inputs.names:
            if not name.counter - query.counter:
                remainder = query.counter - name.counter
                for noun in inputs.nouns:
                    if not noun.counter - remainder:
                        if not remainder - noun.counter:
                            yield f"{name.word} {noun.word}"
                            continue


class NounNameAlgorithm(AnagramAlgorithm):
    async def find(self, inputs: Inputs, query: Query) -> AsyncGenerator[str]:
        for noun in inputs.nouns:
            if not noun.counter - query.counter:
                remainder = query.counter - noun.counter
                for name in inputs.names:
                    if not name.counter - remainder:
                        if not remainder - name.counter:
                            yield f"{noun.word} {name.word}"
                            continue
