---
title: "Advent of Code in Kotlin 2021 - Day 6"
date: "2021-12-06"
description: "My solutions to Advent of Code in Kotlin - Day 6 of 2021"
image: https://blog.sweller.de/images/advent-of-code.png
tags: adventOfCode,kotlin
---

This is part 6 of a series, so if you haven't read the previous parts, start [here](https://blog.sweller.de/posts/advent-of-code-2021-1).

For today's [puzzle](https://adventofcode.com/2021/day/6) we are asked to simulate the size of a fish population that grows exponentially. We start with a list of fish, each represented by the number of days until it produces offspring. Once the number of days reaches 0, the timer resets to 6 days and a new fish with a timer of 8 days is added.

The description suggests a naive approach of simulating fish individually, but it heavily hints at the exponential nature of this problem. That makes it clear pretty quickly that today marks the day when performance starts mattering.

In this case there is a clear solution to keep the required work from growing with the number of fish: Instead of simulating fish individually, we will group all fish with the same timer and only keep track of counts. If we use Longs to represent the counts, day 1 (simulating 80 days) and day 2 (simulating 256 days) can be solved in one go.

```kotlin
private fun solve(fish: List<Int>, days: Int): Long {
    var timerCounts = fish.groupBy { it }.mapValues { it.value.count().toLong() }
    repeat(days) {
        timerCounts = (0..7)
            .associateWith { timerCounts.getOrDefault(it + 1, 0) }
            .plus(6 to timerCounts.getOrDefault(7, 0) + timerCounts.getOrDefault(0, 0))
            .plus(8 to timerCounts.getOrDefault(0, 0))
    }
    return timerCounts.values.sum()
}
```

I used the repeat function here to run a set number of days and a map of `<Int, Long>` to represent the fish population, where the Int is a timer duration and the long is the number of fish with that duration in the population. Each day, the counts shift down by 1, so the new count for fish with a timer of 1 is yesterday's count for fish with a timer of 2.

There are two exceptions: The count for a timer of 8 is yesterday's count of 0 (the offspring) and the count for a timer of 6 is yesterday's count of 7 _and_ yesterday's count for a timer of 0 (the fish that just produced offspring). Since yesterday's count for a timer of 0 is used twice, we get exponential growth.

We can use that function to get the answer for both parts.

```kotlin
fun main() {
    val fish = inputText(2021, 6).split(",").map(String::toInt)
    println(solve(fish, 80))
    println(solve(fish, 256))
}
```

Note: If the counts weren't too big for Integers, we could have used this slightly more elegant option for calculating the initial count:

```kotlin
var timerCounts = fish.groupingBy { it }.eachCount()
```

Pretty neat. Alas, we need Longs here. Nevertheless, that's a nice, quick solution for day 6 and two more stars in the bag.
