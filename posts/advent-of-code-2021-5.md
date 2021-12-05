---
title: "Advent of Code in Kotlin 2021 - Day 5"
date: "2021-12-05"
description: "My solutions to Advent of Code in Kotlin - Day 5 of 2021"
image: https://blog.sweller.de/images/advent-of-code.png
tags: adventOfCode,kotlin
---

This is part 5 of a series, so if you haven't read the previous parts, start [here](https://blog.sweller.de/posts/advent-of-code-2021-1).

For today's [puzzle](https://adventofcode.com/2021/day/5) you are given a list of lines on 2D grid, including horizontal, vertical and diagonal lines. Each line is defined by its start and end point (your puzzle input) and your task is to count the number of spaces where multiple lines overlap.

Given the moderate size of the puzzle input, a brute force approach is fine here, so we set up a grid with a count of 0 for each point, iterate over the lines and add 1 to each point a line covers (skipping diagonals for part 1)

```kotlin
private fun part1(lines: List<Line>): Int {
    val grid = Array(1000) { IntArray(1000) { 0 } }

    lines
        .filter { it.type != Type.DIAGONAL }
        .forEach { it.points.forEach { point -> grid[point.y][point.x]++ } }

    return grid.sumOf { line -> line.count { it > 1 } }
}

private fun part2(lines: List<Line>): Int {
    val grid = Array(1000) { IntArray(1000) { 0 } }

    lines.forEach { it.points.forEach { point -> grid[point.y][point.x]++ } }

    return grid.sumOf { line -> line.count { it > 1 } }
}
```

Most of the work is in getting the input data into a useful shape. I've opted to define a line as a start point, an end point and a type. It has a virtual property for getting the points on the line.

```kotlin
private data class Line(val start: Point, val end: Point, val type: Type) {
    val points: List<Point>
        get() = when (type) {
            Type.HORIZONTAL -> xRange.map { x -> Point(x, start.y) }
            Type.VERTICAL -> yRange.map { y -> Point(start.x, y) }
            Type.DIAGONAL -> xRange.zip(yRange).map { Point(it.first, it.second) }
        }
    val xRange: IntProgression
        get() = if (end.x > start.x) (start.x..end.x) else (start.x downTo end.x)
    val yRange: IntProgression
        get() = if (end.y > start.y) (start.y..end.y) else (start.y downTo end.y)
}

private fun getLineType(start: Point, end: Point) = when {
    start.x == end.x -> Type.VERTICAL
    start.y == end.y -> Type.HORIZONTAL
    else -> Type.DIAGONAL
}

private enum class Type {
    HORIZONTAL,
    VERTICAL,
    DIAGONAL,
}

private data class Point(val x: Int, val y: Int)

```

All that's left is to parse the input into lines and run the two solver functions.

```kotlin
fun main() {
    val lines = inputLines(2021, 5)
        .map { line -> line.split(" -> ").map { it.split(",").map(String::toInt) }.map { (x, y) -> Point(x, y) } }
        .map { (start, end) -> Line(start, end, getLineType(start, end)) }
    println(part1(lines))
    println(part2(lines))
}
```

One point that tripped me up a bit was accounting for lines running in different directions (accounted for in the xRange and yRange virtual properties), but other than this I got through this one pretty well. Two more stars in the bag.
