---
title: "Advent of Code in Kotlin 2021 - Day 15"
date: "2021-12-15"
description: "My solutions to Advent of Code in Kotlin - Day 15 of 2021"
image: https://blog.sweller.de/images/advent-of-code.png
tags: adventOfCode,kotlin
---

This is part 15 of a series, so if you haven't read the previous parts, start [here](https://blog.sweller.de/posts/advent-of-code-2021-1).

For today's [puzzle](https://adventofcode.com/2021/day/15) we are given a grid of digits between 1 and 9 where each digit represents the risk of navigating that position in a cave. Our task is to find the path from our starting point (top left) to our destination (bottom right) that has the smallest total risk.

After a bit of thought, I decided to implement this using a priority queue based on the total risk of the path so far. Since we only care about the total risk so far, we don't need to store the total path, just the accumulated risk. Neighbours of the current point are only visited if they haven't been visited before. Since we're always continuing from the lowest current risk, any other paths that also lead to them can't have lower risk. I think this is essentially Dijkstra's algorithm.

```kotlin
private fun solve(input: List<List<Int>>): Int {
    val start = Point(0 , 0)
    val destination = Point(input.lastIndex, input.first().lastIndex)

    val seen = mutableSetOf(start)
    val queue = PriorityQueue<ContinuationPoint>(compareBy { it.risk }).also { it.add(ContinuationPoint(start, 0)) }

    while (queue.peek().position != destination) {
        val (position, risk) = queue.poll()
        position.getNeighbours()
            .filter { it.x in 0..destination.x && it.y in 0..destination.y }
            .filterNot { seen.contains(it) }.forEach { neighbour ->
                (risk + input[neighbour.y][neighbour.x]).let { neighbourRisk ->
                    queue.add(ContinuationPoint(neighbour, neighbourRisk))
                }
                seen.add(neighbour)
            }
    }
    return queue.poll().risk
}

private data class Point(val x: Int, val y: Int) {
    fun getNeighbours(): Set<Point> =
        setOf(Point(x - 1, y), Point(x + 1, y), Point(x, y + 1), Point(x, y - 1))
}
private data class ContinuationPoint(val position: Point, val risk: Int)
```

This approach is good enough for both part 1 and part 2 (where the input is repeated 25 times, adding the horizontal and vertical offset to each section of the grid and looping back around at 10). Part 2 is a bit on the slow side, so there's probably something more efficient, but this will do just fine.

```kotlin
fun main() {
    val input = inputLines(2021, 15).map { line -> line.map { it.toString().toInt() } }
    println(solve(input))
    println(solve(expandInput(input)))
}

private fun expandInput(input: List<List<Int>>): List<List<Int>> {
    val valueMapper = { value: Int -> if (value == 9) 1 else value + 1 }
    val rows = input.map { generateSequence(it) { row -> row.map(valueMapper) }.take(5).toList().flatten() }
    return generateSequence(rows) { chunk -> chunk.map { row -> row.map(valueMapper) } }.take(5).toList().flatten()
}
```

Two more stars in the bag & just 10 more days left.
