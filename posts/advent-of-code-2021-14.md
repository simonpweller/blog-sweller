---
title: "Advent of Code in Kotlin 2021 - Day 14"
date: "2021-12-14"
description: "My solutions to Advent of Code in Kotlin - Day 14 of 2021"
image: https://blog.sweller.de/images/advent-of-code.png
tags: adventOfCode,kotlin
---

This is part 14 of a series, so if you haven't read the previous parts, start [here](https://blog.sweller.de/posts/advent-of-code-2021-1).

For today's [puzzle](https://adventofcode.com/2021/day/14) we are given a polymer template (string of letters) and a list of pair insertion rules (mapping from two letters to a letter that should be inserted in between them).

For part1 we are asked to go through the insertion process 10 times. Each time the string size more or less doubles, so there's a strong hint this will grow exponentially, but let's start with a naive approach.

Using Kotlin's windowed method, we can build the pairs, map them to inserts and zip the two together (we have to add the last letter in the end since the list of inserts is one shorter than the list of pairs).

To get the solution, we need the difference between the occurrence count of the most frequent and the least frequent character.

```kotlin
fun main() {
    val input = inputLines(2021, 14)
    val polymerTemplate = input.first()
    val insertionRules = input.drop(2).associate { it.split(" -> ").let { (pair, insertion) -> pair to insertion } }

    println(part1(polymerTemplate, insertionRules))
}

private fun part1(polymerTemplate: String, insertionRules: Map<String, String>): Int =
    generateSequence(polymerTemplate) { polymer -> insert(polymer, insertionRules) }
        .drop(1).take(10).last()
        .let { finalPolymer ->
            finalPolymer.groupingBy { it }.eachCount().let { counts ->
                max(counts.values) - min(counts.values)
            }
        }

private fun insert(polymerTemplate: String, insertionRules: Map<String, String>): String =
    polymerTemplate.windowed(2).map { pair -> insertionRules[pair] }.joinToString("").let { inserts ->
        polymerTemplate.zip(inserts).flatMap { listOf(it.first, it.second) }.plus(polymerTemplate.last())
            .joinToString("")
    }
```

For part 2, we have to repeat the process 40 times, so the string would get _very_ long. Instead of keeping track of the string we can keep track of how often each pair occurs - this will scale linearly. We also need longs now for the counts.

```kotlin
private fun part1(dots: Set<Pair<Int, Int>>, folds: List<Fold>): Int = applyFold(dots, folds.first()).size
fun main() {
    val input = inputLines(2021, 14)
    val polymerTemplate = input.first()
    val insertionRules = input.drop(2).associate {
        it.split(" -> ").let { (pair, insertion) ->
            pair to Pair(pair.first() + insertion, insertion + pair.last())
        }
    }

    println(solve(polymerTemplate, insertionRules, 10))
    println(solve(polymerTemplate, insertionRules, 40))
}

private fun solve(polymerTemplate: String, insertionRules: Map<String, Pair<String, String>>, iterations: Int): Long {
    val pairCounts =
        polymerTemplate.windowed(2).groupingBy { it }.eachCount().mapValues { (_, value) -> value.toLong() }
    val finalPairCounts = generateSequence(pairCounts) { insert(it, insertionRules) }.drop(iterations).take(1).first()
    val letterCounts = getLetterCounts(finalPairCounts, polymerTemplate)

    return max(letterCounts.values) - min(letterCounts.values)
}

private fun getLetterCounts(
    pairCounts: Map<String, Long>,
    polymerTemplate: String
): Map<Char, Long> {
    val letterCounts = mutableMapOf<Char, Long>()
    pairCounts.entries.forEach { (key, value) ->
        letterCounts[key.first()] = letterCounts.getOrDefault(key.first(), 0) + value
        letterCounts[key.last()] = letterCounts.getOrDefault(key.last(), 0) + value
    }
    // all but first & last char are in two pairs, so have to deduplicate counts
    return letterCounts.entries.associate { (key, value) ->
        when (key) {
            polymerTemplate.first(), polymerTemplate.last() -> key to (value + 1) / 2
            else -> key to value / 2
        }
    }
}

private fun insert(
    polymerTemplate: Map<String, Long>,
    insertionRules: Map<String, Pair<String, String>>
): Map<String, Long> = mutableMapOf<String, Long>().also { next ->
    polymerTemplate.forEach { (pair, count) ->
        val (leftNew, rightNew) = insertionRules.getValue(pair)
        next[leftNew] = next.getOrDefault(leftNew, 0) + count
        next[rightNew] = next.getOrDefault(rightNew, 0) + count
    }
}
```

This was a very classical advent of code problem - easy to get stuck on part 2, I think. Two more stars in the bag.
