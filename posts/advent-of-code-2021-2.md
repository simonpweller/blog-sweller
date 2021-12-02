---
title: "Advent of Code in Kotlin 2021 - Day 2"
date: "2021-12-02"
description: "My solutions to Advent of Code in Kotlin - Day 2 of 2021"
image: https://blog.sweller.de/images/advent-of-code.png
tags: adventOfCode kotlin
---

This is part 2 of a series, so if you haven't read part 1, you can find it [here](https://blog.sweller.de/posts/advent-of-code-2021-1).

Today's puzzle is another Advent of Code classic: parsing instructions and simulating what happens when you carry them out. In this case the instructions are for moving a submarine, either up, down or forward.

For these puzzles, I usually make a simple data class and parse the instruction strings into a list of instances of that class. This is totally optional and should probably be skipped if you're aiming for the leaderboard. I like to take the time and include this step though.

```kotlin
private fun parseCommands(input: String): Command = input.split(" ")
    .let { Command(Direction.valueOf(it.first().uppercase(Locale.getDefault())), it.last().toInt()) }

private enum class Direction { FORWARD, UP, DOWN }
private data class Command(val direction: Direction, val distance: Int)
```

For part 1, the up and down instructions decrease and increase the depth respectively while the forward instruction increases the horizontal position. I went for a simple function here, iterating over the commands. There's other options here like folding over the commands, but in this case the procedural approach seems more readable to me.

```kotlin
private fun part1(commands: List<Command>): Long {
    var horizontalPosition = 0L
    var depth = 0L

    commands.forEach { (direction, distance) ->
        when (direction) {
            Direction.FORWARD -> horizontalPosition += distance
            Direction.UP -> depth -= distance
            Direction.DOWN -> depth += distance
        }
    }

    return horizontalPosition * depth
}
```

Part 2 is very similar only now the up and down instructions change the aim (an indication for how many steps up or down any forward each step of forward movement should carry the submarine). I used the same approach, just changing the branches of the `when` statement and adding an extra variable.

```kotlin
private fun part2(commands: List<Command>): Long {
    var horizontalPosition = 0L
    var depth = 0L
    var aim = 0L

    commands.forEach { (direction, distance) ->
        when (direction) {
            Direction.FORWARD -> {
                horizontalPosition += distance
                depth += distance * aim
            }
            Direction.UP -> aim -= distance
            Direction.DOWN -> aim += distance
        }
    }

    return horizontalPosition * depth
}
```

There's some duplication between the two functions, but I wasn't sure factoring it out would add much clarity, so for now I've left the code a bit "moist". Submarines seem to be this year's theme, so I have a feeling I might come back to this code.
