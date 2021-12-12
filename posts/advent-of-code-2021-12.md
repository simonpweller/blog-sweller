---
title: "Advent of Code in Kotlin 2021 - Day 12"
date: "2021-12-12"
description: "My solutions to Advent of Code in Kotlin - Day 12 of 2021"
image: https://blog.sweller.de/images/advent-of-code.png
tags: adventOfCode,kotlin
---

This is part 12 of a series, so if you haven't read the previous parts, start [here](https://blog.sweller.de/posts/advent-of-code-2021-1).

For today's [puzzle](https://adventofcode.com/2021/day/12) we are given a list of links between rooms in a cave system. I parsed this input into a map from a room to the set of rooms it connects to.

```kotlin
private fun getConnections(input: List<String>): Map<String, Set<String>> = input.map { it.split("-") }
    .fold(mapOf()) { map, (left, right) ->
        map
            .plus(left to map.getOrDefault(left, emptySet()).plus(right))
            .plus(right to map.getOrDefault(right, emptySet()).plus(left))
    }
```

For part 1 we have to find all paths from "start" to "end", passing small rooms (indicated by lower case letters) only once.

We don't care about what the path actually is, so all we have to keep track of for a path is the current room and what small rooms we have already seen.

Using a queue, we can walk the paths with a breadth-first-search until they hit the end or fizzle out. Whenever we enter a small room, we add it to the list of seen locations for that path.

```kotlin
private fun part1(connections: Map<String, Set<String>>): Int {
    val queue = LinkedList<Pair<String, Set<String>>>()
    queue.add(Pair("start", setOf("start")))
    var pathCount = 0
    while (queue.isNotEmpty()) {
        val (location, seen) = queue.poll()
        if (location == "end") {
            pathCount++
        } else {
            val nextLocations = connections.getValue(location).filter { it != "start" && (!seen.contains(it)) }
            queue.addAll(nextLocations.map { nextLocation ->
                when {
                    nextLocation.first().isUpperCase() -> Pair(nextLocation, seen)
                    else -> Pair(nextLocation, seen.plus(nextLocation))
                }
            })
        }
    }
    return pathCount
}
```

In part 2, there is a slight complication in that we can access one small room (but not start or end) twice. Conceptually we can think of that as a joker and extend our solution with a flag. Flags are a bit of a code smell, but I think it's reasonably intuitive in this case.

```kotlin
private fun solve(connections: Map<String, Set<String>>, useJoker: Boolean): Int {
    val queue = LinkedList<Triple<String, Set<String>, Boolean>>()
    queue.add(Triple("start", setOf("start"), useJoker))
    var pathCount = 0
    while (queue.isNotEmpty()) {
        val (location, seen, jokerAvailable) = queue.poll()
        if (location == "end") {
            pathCount++
        } else {
            val nextLocations = connections.getValue(location)
                .filter { it != "start" && (!seen.contains(it) || jokerAvailable) }
            queue.addAll(nextLocations.map { nextLocation ->
                when {
                    nextLocation.first().isUpperCase() -> Triple(nextLocation, seen, jokerAvailable)
                    seen.contains(nextLocation) -> Triple(nextLocation, seen, false)
                    else -> Triple(nextLocation, seen.plus(nextLocation), jokerAvailable)
                }
            })
        }
    }
    return pathCount
}
```

And that's really all we need to solve both parts.

```kotlin
fun main() {
    val input = inputLines(2021, 12)
    println(solve(getConnections(input), useJoker = false))
    println(solve(getConnections(input), useJoker = true))
}
```

I got done with today's puzzle surprisingly quickly. Mercifully, the adjusted difficulty curve we saw in 2021 seems to be here to stay (knock on wood). Two more stars in the bag.
