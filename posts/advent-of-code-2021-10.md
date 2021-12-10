---
title: "Advent of Code in Kotlin 2021 - Day 10"
date: "2021-12-10"
description: "My solutions to Advent of Code in Kotlin - Day 10 of 2021"
image: https://blog.sweller.de/images/advent-of-code.png
tags: adventOfCode,kotlin
---

This is part 10 of a series, so if you haven't read the previous parts, start [here](https://blog.sweller.de/posts/advent-of-code-2021-1).

For today's [puzzle](https://adventofcode.com/2021/day/10) we are given a list of lines of various brackets, e.g. `[({(<(())[]>[[{[]{<()<>>`. For each line we have to check whether it is corrupted, meaning a closing bracket occurs, which does not match the last unmatched opening bracket.

I did a fair bit of refactoring for this one after I had a working solution, but in the end, I defined a couple of extension properties on the Char class. These can be used just like native properties and are one of Kotlin's killer features in my opinion. To clarify that these are not meant to be used on all Chars, I defined a typealias.

```kotlin
typealias Bracket = Char

private val Bracket.isClosing: Boolean
    get() = setOf(')', ']', '}', '>').contains(this)``

private val Bracket.match: Char
    get() = when (this) {
        ')' -> '('
        '(' -> ')'
        ']' -> '['
        '[' -> ']'
        '}' -> '{'
        '{' -> '}'
        '>' -> '<'
        '<' -> '>'
        else -> throw IllegalArgumentException("Unexpected character")
    }
```

With these extension functions, we can now build up a list of unmatched brackets for a line by keeping track of the unmatched brackets. If a closing bracket matches the last unmatched open bracket, we remove the opening bracket from the list (consider it matched). Opening brackets and closing brackets that don't match up are added to the list. If the list of unmatched brackets includes closing brackets, the line is considered corrupted, otherwise it is merely incomplete.

```kotlin
private data class ProgramLine(val brackets: String) {
    val unmatchedBrackets: List<Bracket>
        get() = brackets
            .fold(emptyList()) { unmatchedBrackets, bracket ->
                when {
                    bracket.isClosing && bracket.match == unmatchedBrackets.last() -> unmatchedBrackets.dropLast(1)
                    else -> unmatchedBrackets.plus(bracket)
                }
            }

    val isCorrupted: Boolean
        get() = unmatchedBrackets.any { it.isClosing }
}
```

Finally, we have to score the lines. For part 1, we have to score each corrupted line based on the first unmatched closing bracket and sum over all lines. We add another virtual property to ProgramLine and another extension property to our Bracket type.

```kotlin

private data class ProgramLine(val brackets: String) {
    val unmatchedBrackets: List<Bracket>
        get() = brackets
            .fold(emptyList()) { unmatchedBrackets, bracket ->
                when {
                    bracket.isClosing && bracket.match == unmatchedBrackets.last() -> unmatchedBrackets.dropLast(1)
                    else -> unmatchedBrackets.plus(bracket)
                }
            }

    val isCorrupted: Boolean
        get() = unmatchedBrackets.any { it.isClosing }

//  New!
    val syntaxErrorScore: Int
        get() = unmatchedBrackets
            .firstOrNull { it.isClosing }?.illegalCharacterScore ?: 0
}

private val Bracket.illegalCharacterScore: Int
    get() = when (this) {
        ')' -> 3
        ']' -> 57
        '}' -> 1197
        '>' -> 25137
        else -> throw IllegalArgumentException("Not a closing bracket")
    }
```

For part 2, we have to do a bit more work, iterating over all unmatched open brackets of the non-corrupted lines and building up a score. The approach is more or less the same though - another virtual property for ProgramLine and another extension property for Bracket:

```kotlin
private data class ProgramLine(val brackets: String) {
    val unmatchedBrackets: List<Bracket>
        get() = brackets
            .fold(emptyList()) { unmatchedBrackets, bracket ->
                when {
                    bracket.isClosing && bracket.match == unmatchedBrackets.last() -> unmatchedBrackets.dropLast(1)
                    else -> unmatchedBrackets.plus(bracket)
                }
            }

    val isCorrupted: Boolean
        get() = unmatchedBrackets.any { it.isClosing }

//  New!
    val completionStringScore: Long
        get() = unmatchedBrackets
            .reversed()
            .fold(0L) { score, bracket -> score * 5 + bracket.closingCharacterScores }
}

private val Bracket.closingCharacterScores: Int
    get() = when (this) {
        '(' -> 1
        '[' -> 2
        '{' -> 3
        '<' -> 4
        else -> throw IllegalArgumentException("Not an opening bracket")
    }
```

Finally, we can calculate the scores for both parts and solve the puzzle.

```kotlin
fun main() {
    val lines = inputLines(2021, 10).map(::ProgramLine)
    println(part1(lines))
    println(part2(lines))
}

private fun part1(lines: List<ProgramLine>) = lines
    .sumOf { it.syntaxErrorScore }

private fun part2(lines: List<ProgramLine>) = lines
    .filterNot { it.isCorrupted }.let { incompleteLines ->
        incompleteLines.map { it.completionStringScore }.sorted()[incompleteLines.size / 2]
    }
```

Two more stars in the bag.
