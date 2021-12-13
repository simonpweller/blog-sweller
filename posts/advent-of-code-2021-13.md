---
title: "Advent of Code in Kotlin 2021 - Day 13"
date: "2021-12-13"
description: "My solutions to Advent of Code in Kotlin - Day 13 of 2021"
image: https://blog.sweller.de/images/advent-of-code.png
tags: adventOfCode,kotlin
---

This is part 13 of a series, so if you haven't read the previous parts, start [here](https://blog.sweller.de/posts/advent-of-code-2021-1).

For today's [puzzle](https://adventofcode.com/2021/day/13) we are given a list of 2D positions representing dots and a set of instructions on how to fold the paper. As we apply the folds, the position of the dots has to be adjusted accordingly and some dots overlap.

I worked out a simple formula for adjusting dot positions with pen and paper and wrote up a bit of code to apply a fold to a set of dots.

```kotlin
private data class Fold(val axis: Axis, val position: Int)
private enum class Axis {
    X, Y;

    companion object {
        fun of(input: String): Axis = if (input[11] == 'x') X else Y
    }
}

private fun applyFold(dots: Set<Pair<Int, Int>>, fold: Fold): Set<Pair<Int, Int>> = when (fold.axis) {
    Axis.X -> dots.map { (x, y) ->
        if (x > fold.position) Pair(2 * fold.position - x, y) else Pair(x, y)
    }
    Axis.Y -> dots.map { (x, y) ->
        if (y > fold.position) Pair(x, 2 * fold.position - y) else Pair(x, y)
    }
}.toSet()
```

For part 1, we just have to apply the first fold and count the number of dots after adjusting for overlapping. For part 2 we have to apply all the folds. Afterwards, the remaining dots spell out eight capital letters as ASCII art. I ended up using the fold method to fold the folds (😂), printed the ASCII art to screen and visually read the result.

```kotlin
private fun part1(dots: Set<Pair<Int, Int>>, folds: List<Fold>): Int = applyFold(dots, folds.first()).size
private fun part2(dots: Set<Pair<Int, Int>>, folds: List<Fold>): String {
    val foldedDots = folds.fold(dots) { d, fold -> applyFold(d, fold) }

    val xRange = 0..foldedDots.maxOf { it.first }
    val yRange = 0..foldedDots.maxOf { it.second }

    return yRange.joinToString(System.lineSeparator()) { y ->
        xRange.map { x -> if (foldedDots.contains(Pair(x, y))) '#' else '.' }.joinToString("")
    }
}

fun main() {
    val input = inputLines(2021, 13)
    val dots =
        input.takeWhile { it.isNotBlank() }.map { it.split(",") }.map { Pair(it.first().toInt(), it.last().toInt()) }
            .toSet()
    val folds = input.drop(dots.size + 1).map { Fold(Axis.of(it), it.substringAfter("=").toInt()) }
    println(part1(dots, folds))
    println(part2(dots, folds))
}
```

Another quick one, not too bad at all. That's two more stars in the bag.
