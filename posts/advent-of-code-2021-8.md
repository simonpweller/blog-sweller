---
title: "Advent of Code in Kotlin 2021 - Day 8"
date: "2021-12-08"
description: "My solutions to Advent of Code in Kotlin - Day 8 of 2021"
image: https://blog.sweller.de/images/advent-of-code.png
tags: adventOfCode,kotlin
---

This is part 8 of a series, so if you haven't read the previous parts, start [here](https://blog.sweller.de/posts/advent-of-code-2021-1).

Today's [puzzle](https://adventofcode.com/2021/day/8) is my favourite so far. Your task is to correctly interpret 4 digit output from seven-segment-displays. The catch is that you are given the identifiers for the segments for each of the four digits, but they are jumbled, so you don't know which segment each identifier corresponds to.

You are given a list of identifiers of active segments for each of the digits for 0-9 though, so you can use that to infer what segment each identifier corresponds to. I am sure there are some clever algorithms for this, but I just used good old-fashioned deduction. I love this kind of puzzle.

For part 1 you can technically skip this part since you're just asked to count the number of digits with a unique number of active segments (1, 4, 7, 8), but I've just folded it into the solution for part 2.

The meat of the solution is a function to map each set of identifiers to the corresponding digit. I started by identifying the c-segment (top right). Of the two segments in a one, it's the only one not shared by all six-segment digits. The other one (f-segment, bottom right) is in all of them (0, 6, 9).

With those two segments identified, I was able to isolate the remaining digits step by step.

```kotlin
private fun identifyDigits(digits: List<Set<Char>>): Map<Set<Char>, String> {
    val one = digits.first { it.size == 2 }
    val seven = digits.first { it.size == 3 }
    val four = digits.first { it.size == 4 }
    val eight = digits.first { it.size == 7 }
    val fiveSegmentDigits = digits.filter { it.size == 5 }
    val sixSegmentDigits = digits.filter { it.size == 6 }

    val cSegment = one.first { !sixSegmentDigits.all { sixSegmentDigit -> sixSegmentDigit.contains(it) } }
    val fSegment = one.first { it != cSegment }
    val six = sixSegmentDigits.first { !it.contains(cSegment) }
    val three = fiveSegmentDigits.first { it.containsAll(one) }
    val two = fiveSegmentDigits.first { it.contains(cSegment) && !it.contains(fSegment) }
    val five = fiveSegmentDigits.first { !it.contains(cSegment) && it.contains(fSegment) }
    val nine = sixSegmentDigits.first { it.containsAll(three) }
    val zero = sixSegmentDigits.first { it != nine && it != six }

    return mapOf(
        zero to "0",
        one to "1",
        two to "2",
        three to "3",
        four to "4",
        five to "5",
        six to "6",
        seven to "7",
        eight to "8",
        nine to "9"
    )
}
```

Using this function, we can now decode the output for an input.

```kotlin
private fun decodeOutput(input: String): Int {
    val (digits, displayDigits) = input.split("|")
        .map { digitString -> digitString.trim().split(" ").map(String::toSet) }
    val digitMap = identifyDigits(digits)
    return displayDigits.joinToString("") { digit -> digitMap.getValue(digit) }.toInt()
}
```

Finally, we count the digits with a unique segment count for part 1 and just sum over the outputs for part 2.

```kotlin
fun main() {
    val inputs = inputLines(2021, 8)
    val outputs = inputs.map(::decodeOutput)
    println(part1(outputs))
    println(part2(outputs))
}

private fun part1(inputs: List<Int>): Int = inputs.sumOf { it.toString().count { digit -> listOf('1', '4', '7', '8').contains(digit) } }
private fun part2(inputs: List<Int>): Int = inputs.sum()
```

That's day 8 done and two more stars in the bag.
