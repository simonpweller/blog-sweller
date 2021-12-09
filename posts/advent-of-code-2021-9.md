---
title: "Advent of Code in Kotlin 2021 - Day 9"
date: "2021-12-09"
description: "My solutions to Advent of Code in Kotlin - Day 9 of 2021"
image: https://blog.sweller.de/images/advent-of-code.png
tags: adventOfCode,kotlin
---

This is part 9 of a series, so if you haven't read the previous parts, start [here](https://blog.sweller.de/posts/advent-of-code-2021-1).

Today's [puzzle](https://adventofcode.com/2021/day/9) is about finding low points in a cave and the size of the basins that flow down to them. The problem set is not particularly large so efficiency is not a major concern.

I'm strapped for a time, so not much of a write-up today, but here's my code:

```kotlin
fun main() {
    val cave = inputLines(2021, 9).map { line -> line.toList().map(Char::toString).map(String::toInt) }
    println(part1(cave))
    println(part2(cave))
}

private fun part1(heightMap: List<List<Int>>): Int {
    val cave = Cave(heightMap)
    val lows = cave.getLows()
    val riskFactors = lows.map { cave.heightAt(it) + 1 }
    return riskFactors.sum()
}

private fun part2(heightMap: List<List<Int>>): Int {
    val cave = Cave(heightMap)
    val lows = cave.getLows()
    val basinSizes = lows.map { cave.getBasinSize(it) }
    return basinSizes.sortedDescending().take(3).reduce { a, b -> a * b }
}

private class Cave(private val map: List<List<Int>>) {
    val points = map.indices.flatMap { y -> map.first().indices.map { x -> Point(x, y) } }

    fun heightAt(point: Point) = map[point.y][point.x]

    fun isLow(point: Point) = getNeighbours(point).all { neighbour -> heightAt(neighbour) > heightAt(point) }

    fun getLows() = points.filter(this::isLow)

    fun getNeighbours(point: Point): List<Point> {
        val (x, y) = point
        val left = if (x == 0) null else Point(x - 1, y)
        val top = if (y == 0) null else Point(x, y - 1)
        val right = if (x == map.first().lastIndex) null else Point(x + 1, y)
        val bottom = if (y == map.lastIndex) null else Point(x, y + 1)
        return listOfNotNull(left, top, right, bottom)
    }

    fun getBasinSize(point: Point): Int {
        val accountedFor = mutableSetOf(point)
        val queue = LinkedList<Point>().also { it.add(point) }
        var basinSize = 0
        while (queue.isNotEmpty()) {
            val next = queue.poll()
            if (heightAt(next) != 9) {
                basinSize++
                getNeighbours(next).let { neighbours ->
                    queue.addAll(neighbours.filter { !accountedFor.contains(it) })
                    accountedFor.addAll(neighbours)
                }
            }
        }
        return basinSize
    }
}
```
