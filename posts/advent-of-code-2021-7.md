---
title: "Advent of Code in Kotlin 2021 - Day 7"
date: "2021-12-07"
description: "My solutions to Advent of Code in Kotlin - Day 7 of 2021"
image: https://blog.sweller.de/images/advent-of-code.png
tags: adventOfCode,kotlin
---

This is part 7 of a series, so if you haven't read the previous parts, start [here](https://blog.sweller.de/posts/advent-of-code-2021-1).

For today's [puzzle](https://adventofcode.com/2021/day/7) we need to help a swarm of crabs to converge on a single position as efficiently as possible. We are given a number of positions and need to figure out where they should all converge.

For part 1, the total movement of all crabs should be minimized. Reading other solutions, I realized you could just use the median position here, but I just iterated over all positions between the smallest and largest starting position.

```kotlin
private fun targetOptions(startingLocations: List<Int>) = min(startingLocations)..max(startingLocations)
```

Now we need a mapping function to calculate how far each crab has to move to get to a target.

```kotlin
private fun distances(startingLocations: List<Int>, target: Int) = startingLocations.map { abs(it - target) }
```

Using these two helpers, we can complete part 1:

```kotlin
private fun part1(startingLocations: List<Int>) = targetOptions(startingLocations)
    .map { distances(startingLocations, it).sum() }
    .minOrNull()
```

For part 2, the cost of movement is no longer equal to the distance, but the triangle number of the distance (summing all numbers from 1 up to the target number). Let's define another helper:

```kotlin
private fun advancedFuelConsumption(distance: Int) = (distance * (distance + 1)) / 2
```

Now we've got part 2 sorted.

```kotlin
private fun part2(startingLocations: List<Int>) = targetOptions(startingLocations)
    .map { distances(startingLocations, it).sumOf { distance -> advancedFuelConsumption(distance) } }
    .minOrNull()
```

Let's clean it up a little more though and define a higher order function for solving this. Rather than convert the distance to fuel cost inline, we pass in a function to do the conversion, which is just the identity function for part 1.

Here's the complete final listing:

```kotlin
fun main() {
    val startingLocations = inputText(2021, 7).split(",").map(String::toInt)
    println(calculateOptimalFuelCost(startingLocations, ::simpleFuelConsumption))
    println(calculateOptimalFuelCost(startingLocations, ::advancedFuelConsumption))
}

private fun calculateOptimalFuelCost(startingLocations: List<Int>, fuelCostFunction: (distance: Int) -> Int) =
    targetOptions(startingLocations)
        .map { target -> distances(startingLocations, target) }
        .map { distances -> distances.sumOf(fuelCostFunction) }
        .minOrNull()

private fun targetOptions(startingLocations: List<Int>) = min(startingLocations)..max(startingLocations)
private fun distances(startingLocations: List<Int>, target: Int) = startingLocations.map { abs(it - target) }
private fun simpleFuelConsumption(distance: Int) = distance
private fun advancedFuelConsumption(distance: Int) = (distance * (distance + 1)) / 2
```

That's day 7 done - two more stars in the bag.
