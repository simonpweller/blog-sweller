---
title: "Advent of Code in Kotlin 2021 - Day 17"
date: "2021-12-17"
description: "My solutions to Advent of Code in Kotlin - Day 17 of 2021"
image: https://blog.sweller.de/images/advent-of-code.png
tags: adventOfCode,kotlin
---

This is part 17 of a series, so if you haven't read the previous parts, start [here](https://blog.sweller.de/posts/advent-of-code-2021-1).

For today's [puzzle](https://adventofcode.com/2021/day/17) we are given a target area in 2 dimensional space and have to aim a shot that lands in the target area based on a set of rules involving gravity and drag. For part 1 we need to determine how high a shot can ark and still hit the target, for part 2 we need to determine the number of possible shots (defined by their initial velocity along each dimension) that hit the target.

I initially assumed, I needed some clever way to limit the search space, but it turns out a brute force solution works just fine. As a result, my code is not particularly clever, I just iterate over the possible shots based on a broad heuristic, trace the shots using a Kotlin sequence and tracking the result.

```kotlin
fun main() {
    val input = inputText(2021, 17)
    val targetXRange = input.substringAfter("x=").substringBefore(",").let(::rangeStringToRange)
    val targetYRange = input.substringAfter("y=").let(::rangeStringToRange)

    val xVelocityRange = (0..targetXRange.last)
    val yVelocityRange = (targetYRange.first..-targetYRange.first)

    val paths = (xVelocityRange).flatMap { x -> yVelocityRange.map { y -> getPath(x,  y, targetXRange, targetYRange) } }
    val hittingPaths = paths.filter(Path::hits)
    println(hittingPaths.maxOf { it.maxY })
    println(hittingPaths.size)
}

private fun rangeStringToRange(rangeString: String): IntRange =
    rangeString.split("..").let { (it.first().toInt()..it.last().toInt()) }

private fun getPath(initialXVelocity: Int, initialYVelocity: Int, targetXRange: IntRange, targetYRange: IntRange): Path =
    generateSequence(Path(0, 0, 0, initialXVelocity, initialYVelocity, false)) { (x, y, maxY, xVelocity, yVelocity, hits) ->
        val nextX = x + xVelocity
        val nextY = y + yVelocity
        val nextHits = hits || (nextX in targetXRange && nextY in targetYRange)
        Path(nextX, nextY, max(maxY, nextY), adjustXVelocity(xVelocity), yVelocity - 1, nextHits, )
    }.takeWhile { it.x <= targetXRange.last && it.y >= targetYRange.first }.last()

private fun adjustXVelocity(xVelocity: Int) = when {
    xVelocity > 0 -> xVelocity - 1
    xVelocity < 0 -> xVelocity + 1
    else -> 0
}

private data class Path(val x: Int, val y: Int, val maxY: Int, val xVelocity: Int, val yVelocity: Int, val hits: Boolean)
```

Two more stars in the bag.
