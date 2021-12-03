---
title: "Advent of Code in Kotlin 2021 - Day 3"
date: "2021-12-03"
description: "My solutions to Advent of Code in Kotlin - Day 3 of 2021"
image: https://blog.sweller.de/images/advent-of-code.png
tags: adventOfCode kotlin
---

This is part 3 of a series, so if you haven't read the previous parts, start [here](https://blog.sweller.de/posts/advent-of-code-2021-1).

Today's [puzzle](https://adventofcode.com/2021/day/3) starts ramping up the difficulty a bit, at least in part 2.

Let's start with part 1 though. You are given a bunch of binary numbers and have to process them looking at individual bits. The task is to reduce the list to a binary numbers twice: Once by taking the _most_ common bit at each position, once by taking the _least_ common bit at each position. You then get the result by converting these binary numbers to decimal and multiplying them.

For my solution, I created a helper function `mostCommonBitAt` and its inverse `leastCommonBitAt`

```kotlin
fun mostCommonBitAt(binaries: List<String>, index: Int) =
    if (binaries.count { it[index] == '1' } >= binaries.size / 2) '1' else '0'
fun leastCommonBitAt(binaries: List<String>, index: Int) =
    if (mostCommonBitAt(binaries, index) == '1') '0' else '1'
```

With these helper functions in hand, all that remains is to loop over the positions twice, applying the functions to the binaries with the corresponding indices.

```kotlin
fun part1(binaries: List<String>): Int {
    val indices = binaries.first().indices
    val gammaRate = indices.map { index -> mostCommonBitAt(binaries, index) }.joinToString("").toInt(2)
    val epsilonRate = indices.map { index -> leastCommonBitAt(binaries, index) }.joinToString("").toInt(2)
    return gammaRate * epsilonRate
}
```

Part 2 is a bit more challenging. Now we're asked to filter down the list of binaries to a single one. First by only keeping those that have the _most_ common bit at index 0, and the most common (among the remaining ones) bit at index 1, etc. Second by going through the same process keeping those that have the _least_ common bit each time.

I ended up solving this by creating a higher order function findRating that takes a function as the argument `getRequiredBitAt`.

```kotlin
fun findRating(binaries: List<String>, getRequiredBitAt: (binaries: List<String>, index: Int) -> Char): String {
    var remainingBinaries = binaries
    binaries.first().indices.forEach { index ->
        remainingBinaries = remainingBinaries.filter { it[index] == getRequiredBitAt(remainingBinaries, index) }
        if (remainingBinaries.size == 1) return remainingBinaries.first()
    }
    throw IllegalArgumentException("Duplicate found")
}
```

We can then re-use the functions from part 1 by passing them in.

```kotlin
fun part2(binaries: List<String>): Int {
    val oxygenGeneratorRating = findRating(binaries, ::mostCommonBitAt).toInt(2)
    val co2ScrubberRating = findRating(binaries, ::leastCommonBitAt).toInt(2)
    return oxygenGeneratorRating * co2ScrubberRating
}
```
