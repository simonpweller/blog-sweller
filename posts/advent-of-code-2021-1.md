---
title: "Advent of Code in Kotlin 2021 - Day 1"
date: "2021-12-01"
description: "My solutions to Advent of Code in Kotlin - Day 1 of 2021"
image: https://blog.sweller.de/images/advent-of-code.png
tags: adventOfCode,kotlin
---

I look forward to Advent of Code every year. It's a series of fun, increasingly challenging puzzles for each day of December (until Christmas) that can be solved in any programming language.

There's 2 puzzles each day with the second one building on the first and typically a bit more challenging. On the 1st, the puzzles are usually pretty relatively straightforward and this year is no exception.

I'll post (some of) my solution here, starting with the first [puzzle](https://adventofcode.com/2021/day/1)

For part 1, you are given a list of numbers (your puzzle input) and have to determine how many numbers are higher than the previous one. In most programming languages this can be solved with a for loop over the indices, but in Kotlin we can take advantage of `windowed`. Used on a list this gives us all pairs of consecutive numbers (a list of lists). Now we can apply a condition - the second number must be higher than the first - and count the number of matches. Done.

```kotlin
fun part1(measurements: List<Long>): Int = measurements
    .windowed(2)
    .count { it.last() > it.first() }
```

For part 2, you are asked to compare sums of consecutive numbers, so you're comparing 1st + 2nd + 3rd to 2nd + 3rd + 4th and so on. Here it might start to get messy with loops, but we can extend the windowing approach by taking windows with size 3 and then windows of size 2 of the windows. Meta.

```kotlin
fun part2(measurements: List<Long>): Int = measurements
    .windowed(3)
    .windowed(2)
    .count { it.last().sum() > it.first().sum() }
```

I'm pretty happy with that approach. Probably not particularly efficient, but on day 1 that's not yet a concern so readability trumps all.
