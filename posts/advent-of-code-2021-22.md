---
title: "Advent of Code in Kotlin 2021 - Day 22"
date: "2021-12-22"
description: "My solutions to Advent of Code in Kotlin - Day 22 of 2021"
image: https://blog.sweller.de/images/advent-of-code.png
tags: adventOfCode,kotlin
---

This is part 22 of a series, so if you haven't read the previous parts, start [here](https://blog.sweller.de/posts/advent-of-code-2021-1).

I really enjoyed today's [puzzle](https://adventofcode.com/2021/day/22) and am happy with my solution for the first time in days.

The key to an efficient implementation is tracking cuboids rather than individual cubes. I made heavy use of Kotlin operator overloads to make it straightforward to subtract one cuboid from another resulting in a new set of cuboids.

For every instruction I subtracted the relevant cuboid from all existing ones before adding it to the set if the instruction was "on". Writing that operator function was a bit of work and required a fair bit of spatial imagination, but once that was in place, the rest was easy.

By turning the initialization procedure region off and seeing how many

```kotlin
fun main() {
    val instructions = inputLines(2021, 22).map(::parseInstruction)
    val cuboidsThatAreOn = instructions.fold(emptySet<Cuboid>()) { set, instruction -> set.apply(instruction) }
    val cubesThatAreOn = cuboidsThatAreOn.sumOf { it.size }
    val initializationProcedureRegion = Cuboid(-50 .. 50, -50 .. 50, -50 .. 50)
    println(
        cubesThatAreOn - cuboidsThatAreOn
            .apply(Instruction(InstructionType.OFF, initializationProcedureRegion))
            .sumOf { it.size })
    println(cubesThatAreOn)
}

private fun parseInstruction(line: String): Instruction {
    val type = if (line.startsWith("on")) InstructionType.ON else InstructionType.OFF
    val ranges = line.substringAfter(" ").split(",")
    return Instruction(type, Cuboid(parseRange(ranges[0]), parseRange(ranges[1]), parseRange(ranges[2])))
}

private fun parseRange(string: String): IntRange = string
    .substring(2, string.length)
    .split("..").map(String::toInt)
    .let { (from, to) -> (from..to) }

private data class Instruction(val type: InstructionType, val cuboid: Cuboid)
private enum class InstructionType { ON, OFF }

private data class Cuboid(val x: IntRange, val y: IntRange, val z: IntRange) {
    val size: Long
        get() = x.size.toLong() * y.size * z.size
    fun overlaps(other: Cuboid): Boolean = x.overlaps(other.x) && y.overlaps(other.y) && z.overlaps(other.z)
    operator fun minus(other: Cuboid): Set<Cuboid> {
        return setOfNotNull(
            if (other.x.first > x.first) {
                Cuboid(x.first until other.x.first, y, z)
            } else null,
            if (other.y.first > y.first) {
                Cuboid(x.overlapWith(other.x), y.first until other.y.first, z)
            } else null,
            if (other.y.last < y.last) {
                Cuboid(x.overlapWith(other.x), other.y.last + 1 .. y.last, z)
            } else null,
            if (other.z.first > z.first) {
                Cuboid(x.overlapWith(other.x), y.overlapWith(other.y), z.first until other.z.first)
            } else null,
            if (other.z.last < z.last) {
                Cuboid(x.overlapWith(other.x), y.overlapWith(other.y), other.z.last + 1 .. z.last)
            } else null,
            if (other.x.last < x.last) {
                Cuboid(other.x.last + 1 .. x.last, y, z)
            } else null,
        )
    }
}

private fun Set<Cuboid>.apply(instruction: Instruction): Set<Cuboid> {
    val (type, cuboid) = instruction
    return this.flatMap { if (it.overlaps(cuboid)) it - cuboid else setOf(it) }.toSet().let {
        if (type == InstructionType.ON) it.plus(cuboid) else it
    }
}

private fun IntRange.overlaps(other: IntRange): Boolean = first <= other.last && last >= other.first
private fun IntRange.overlapWith(other: IntRange): IntRange = max(first, other.first) .. min(last, other.last)
private val IntRange.size: Int
    get() = last - first + 1
```

Two more stars in the bag.
