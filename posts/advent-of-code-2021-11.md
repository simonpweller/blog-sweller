---
title: "Advent of Code in Kotlin 2021 - Day 11"
date: "2021-12-11"
description: "My solutions to Advent of Code in Kotlin - Day 11 of 2021"
image: https://blog.sweller.de/images/advent-of-code.png
tags: adventOfCode,kotlin
---

This is part 11 of a series, so if you haven't read the previous parts, start [here](https://blog.sweller.de/posts/advent-of-code-2021-1).

For today's [puzzle](https://adventofcode.com/2021/day/11) we are given a grid of digits between 1 and 9 where each digit represents the energy level of an octopus 🤷. We have to simulate how this grid changes over time with each iteration called a step. Each step, the energy level goes up by one for each octopus. Then any octopus with an energy level above 9 flashes, increasing the energy level of all adjacent octopuses by 1. Each octopus can only flash once per step, but it can cause another octopus to flash, which causes another octopus to flash and so on. This continues until the grid is stable. Then the energy level for all octopuses that have flashed goes to 0 and the step is concluded.

The whole thing is a bit reminiscent of Conway's Game of Life, but the potential chain reactions require a bit of extra bookkeeping. For that reason, most of my work went into the step method of an `OctopusCavern` class. I would have preferred to avoid the while loop and all those mutable structures, but I didn't really have any clever ideas for that.

```kotlin
private class OctopusCavern(var rows: List<List<Int>>) {
    val coordinates =``
        rows.indices.flatMap { rowIndex -> rows.first().indices.map { colIndex -> Pair(rowIndex, colIndex) } }

    fun step(): Int {
        val flashed = this.rows.map { row -> row.map { false }.toMutableList() }
        val next = this.rows.map { row -> row.map { it + 1 }.toMutableList() }
        do {
            var anyNewFlashes = false
            coordinates.forEach { (row, col) ->
                if (next[row][col] > 9 && !flashed[row][col]) {
                    flashed[row][col] = true
                    anyNewFlashes = true
                    getNeighbours(row, col).forEach { (row, col) -> next[row][col] = next[row][col] + 1 }
                }
            }
        } while (anyNewFlashes)
        coordinates.forEach { (row, col) -> if (flashed[row][col]) next[row][col] = 0 }
        this.rows = next
        return coordinates.count { (row, col) -> flashed[row][col] }
    }

    override fun toString() = rows.joinToString(System.lineSeparator()) { it.joinToString("") }

    fun getNeighbours(rowIndex: Int, colIndex: Int) =
        listOf(Pair(-1, -1), Pair(-1, 0), Pair(-1, 1), Pair(0, -1), Pair(0, 1), Pair(1, -1), Pair(1, 0), Pair(1, 1))
            .map { Pair(rowIndex + it.first, colIndex + it.second) }
            .filter { (row, col) -> row >= 0 && row <= rows.lastIndex && col >= 0 && col <= rows.first().lastIndex }

    companion object {
        fun of(input: List<String>): OctopusCavern =
            OctopusCavern(input.map { it.map(Char::toString).map(String::toInt) })
    }
}
```

The step method returns a count of the number of octopuses that have flashed during that step since we need those for part 1 and part 2. For part 1 we are asked to count the number of steps that occur in 100 steps. Easy enough using repeat.

```kotlin
private fun part1(input: List<String>): Int {
    val octopusCavern = OctopusCavern.of(input)
    var totalFlashes = 0
    repeat(100) {
        totalFlashes += octopusCavern.step()
    }
    return totalFlashes
}
```

For part 2 we need to determine the first step when all octopuses flash, so another open-ended while loop it is 🙄.

```kotlin
private fun part2(input: List<String>): Int {
    val octopusCavern = OctopusCavern.of(input)
    val totalSize = octopusCavern.rows.sumOf { it.size }
    var steps = 0
    do {
        val flashCount = octopusCavern.step()
        steps++
    } while (flashCount != totalSize)
    return steps
}
```

I'm not super enthusiastic about how my code looks in the end, but getting the answers wasn't too much trouble. Two more stars in the bag.
