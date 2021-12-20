---
title: "Advent of Code in Kotlin 2021 - Day 19"
date: "2021-12-19"
description: "My solutions to Advent of Code in Kotlin - Day 19 of 2021"
image: https://blog.sweller.de/images/advent-of-code.png
tags: adventOfCode,kotlin
---

This is part 19 of a series, so if you haven't read the previous parts, start [here](https://blog.sweller.de/posts/advent-of-code-2021-1).

For today's [puzzle](https://adventofcode.com/2021/day/19) we are given a list of scanners with a list of beacon coordinates for each. The coordinates are relative to the location of the scanner and can be flipped and rotated in all sorts of ways. The task is to use the overlap between the scanners to determine the right orientation of each scanner's readings and remove duplicates.

This was another day that I'm not particularly happy with my solution. It's slow and convoluted, but this was a pretty tough task, and I didn't have much free time today. I'll take just hanging on to the streak for now.

```kotlin
fun main() {
    val scanners = inputChunks(2021, 19).map(Scanner.Companion::of)
    var remainingScanners = scanners.drop(1)
    var rotatedLists = listOf(scanners[0])
    var positions = listOf(Point3D(0, 0, 0))
    while (remainingScanners.isNotEmpty()) {
        val (match, rotation, distance) = rotatedLists.map { findMatchingRotation(it, remainingScanners) }.first { it != null }!!
        positions = positions + distance
        remainingScanners = remainingScanners - remainingScanners[match]
        rotatedLists = rotatedLists + rotation
    }
    println(rotatedLists.map { it.points }.flatten().toSet().size)
    println(subListsOfSize(positions, 2).map { (it.first() - it.last()).let { distance -> abs(distance.x) + abs(distance.y) + abs(distance.z) } }.maxOrNull() )
}

private fun findMatchingRotation(listToMatch: Scanner, candidates: List<Scanner>): Triple<Int, Scanner, Point3D>? {
    candidates.forEachIndexed { index, scanner ->
        val (rotation, distance) = listToMatch.findOverlapWith(scanner) ?: return@forEachIndexed
        return Triple(index, rotation, distance)
    }
    return null
}

private data class Scanner(val points: List<Point3D>) {
    val rotations: List<List<Point3D>> = listOf(
        points.map { (x, y, z) -> Point3D(x, y, z) },
        points.map { (x, y, z) -> Point3D(x, -z, y) },
        points.map { (x, y, z) -> Point3D(x, -y, -z) },
        points.map { (x, y, z) -> Point3D(x, z, -y) },
        points.map { (x, y, z) -> Point3D(-x, -y, z) },
        points.map { (x, y, z) -> Point3D(-x, z, y) },
        points.map { (x, y, z) -> Point3D(-x, y, -z) },
        points.map { (x, y, z) -> Point3D(-x, -z, -y) },
        points.map { (x, y, z) -> Point3D(y, z, x) },
        points.map { (x, y, z) -> Point3D(y, x, -z) },
        points.map { (x, y, z) -> Point3D(y, -z, -x) },
        points.map { (x, y, z) -> Point3D(y, -x, z) },
        points.map { (x, y, z) -> Point3D(-y, x, z) },
        points.map { (x, y, z) -> Point3D(-y, z, -x) },
        points.map { (x, y, z) -> Point3D(-y, -x, -z) },
        points.map { (x, y, z) -> Point3D(-y, -z, x) },
        points.map { (x, y, z) -> Point3D(z, x, y) },
        points.map { (x, y, z) -> Point3D(z, y, -x) },
        points.map { (x, y, z) -> Point3D(z, -x, -y) },
        points.map { (x, y, z) -> Point3D(z, -y, x) },
        points.map { (x, y, z) -> Point3D(-z, y, x) },
        points.map { (x, y, z) -> Point3D(-z, x, -y) },
        points.map { (x, y, z) -> Point3D(-z, -y, -x) },
        points.map { (x, y, z) -> Point3D(-z, -x, y) },
    )

    fun findOverlapWith(other: Scanner): Pair<Scanner, Point3D>? = other.rotations
        .forEach { rotation ->
            val combinations = combinations(this.points, rotation)
            val distances = combinations.map { (a, b) -> a - b }
            val distanceCounts = distances.groupingBy { it }.eachCount()
            val distance = distanceCounts.entries.firstOrNull { it.value == 12 }?.key
            if (distance != null) return Pair(Scanner(rotation.map { it.plus(distance) }), distance)
        }.let { null }

    companion object {
        fun of(input: String) = Scanner(
            input.split(System.lineSeparator()).drop(1)
                .map {
                    it.split(",")
                        .map(String::toInt)
                        .let { coordinates -> Point3D(coordinates[0], coordinates[1], coordinates[2]) }
                }
        )
    }
}

private data class Point3D(val x: Int, val y: Int, val z: Int) {
    operator fun minus(other: Point3D): Point3D = Point3D(this.x - other.x, this.y - other.y, this.z - other.z)
    operator fun plus(other: Point3D): Point3D = Point3D(this.x + other.x, this.y + other.y, this.z + other.z)
}

/**
 * Returns a list of lists covering all combinations of items in the first and second list
 * combinations(listOf("a", "b"), listOf("c", "d")) -> [["a", "c"], ["a", "d"], ["b", "c"], ["b", "d"]]
 */
private fun <T> combinations(firstList: List<T>, secondList: List<T>): List<List<T>> =
    firstList.map { first -> secondList.map { second -> listOf(first, second) } }.flatten()

/**
 * Returns a list of lists, covering all possible subLists of a given size
 * subListsOfSize(listOf(1, 2, 3), 1) -> [[1], [2], [3]]
 * subListsOfSize(listOf(1, 2, 3), 2) -> [[2, 1], [3, 1], [1, 2], [3, 2], [1, 3], [2, 3]]
 */
private fun <T>subListsOfSize(list: List<T>, size: Int): List<List<T>> {
    if (size == 1) return list.map { listOf(it) }
    return list.map { subListsOfSize(list.minus(it), size - 1).map { subList -> subList.plus(it)} }.flatten()
}
```

Two more stars in the bag, but I sure hope I can come up with something nicer tomorrow.
