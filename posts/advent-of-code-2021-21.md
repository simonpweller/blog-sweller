---
title: "Advent of Code in Kotlin 2021 - Day 21"
date: "2021-12-21"
description: "My solutions to Advent of Code in Kotlin - Day 21 of 2021"
image: https://blog.sweller.de/images/advent-of-code.png
tags: adventOfCode,kotlin
---

This is part 21 of a series, so if you haven't read the previous parts, start [here](https://blog.sweller.de/posts/advent-of-code-2021-1).

For today's [puzzle](https://adventofcode.com/2021/day/21) we are asked to simulate a dice game. Part 1 is straightforward, but part 2 scales exponentially, so some optimization is needed. I had a working idea pretty quickly, but working through it took a fair bit of time.

For part 1, I went with a straightforward OOP solution.

```kotlin
fun main() {
    val (player1Start, player2Start) = inputLines(2021, 21).map { it.last().toString().toInt() }
    val diracDice = DiracDice(player1Start, player2Start)
    println(diracDice.play())
}

private class DiracDice(player1Position: Int, player2Position: Int) {
    val player1 = Player(player1Position, 0)
    val player2 = Player(player2Position, 0)
    val dice = Dice(1)
    var nextPlayer = player1

    fun play(): Int {
        while (!hasEnded) {
            nextPlayer.play(dice)
            toggleNextPlayer()
        }
        return losingPlayer.points * dice.rollCount
    }

    private val hasEnded: Boolean
        get() = player1.hasWon || player2.hasWon

    private val losingPlayer: Player
        get() = if (player1.hasWon) player2 else player1

    private fun toggleNextPlayer() {
        nextPlayer = if (nextPlayer == player1) player2 else player1
    }
}

private class Player(var position: Int, var points: Int) {
    fun play(dice: Dice) {
        repeat(3) {
            position = ((position + dice.roll()) % 10).let { if (it == 0) 10 else it }
        }
        points += position
    }

    val hasWon: Boolean
        get() = points >= 1000
}

private class Dice(var next: Int, var rollCount: Int = 0) {
    fun roll(): Int = next.also {
        next = (next + 1).let { if (it > 100) it - 100 else it }
        rollCount++
    }
}
```

For part 2, each turn of the game spawns 27 alternative universes, so while we have to determine in how many of them player 1 wins, we cannot simulate them all individually. I pretty much started from scratch here, defining a data class for potential game states with a split method that would return the potential next states along with a count.

Next I constructed a map from each game state to the counts of the next states stopping when a state has a winner. Since there is a lot of duplication (the same game state can be reached in various ways), this cuts down on the work needed.

Starting with the states that already have a winner, I then worked my way backward, summing up the outcomes for each state based on the outcomes of the child states. If not all child states were determined, I pushed the state to the back of the queue. This is probably not ideal, but it's good enough.

Working backwards this way, we eventually, get back to our initial state and have the total wincounts for each player.

```kotlin
private fun part2(player1Position: Int, player2Position: Int): Long {
    val initialGameState = GameState(player1Position, player2Position, true, 0, 0)
    val gameStateTransitionMap = constructGameStateTransitionMap(initialGameState)
    val gameStateWinCountsMap = constructGameStateWinCountMap(gameStateTransitionMap)
    val finalWinCounts = gameStateWinCountsMap.getValue(initialGameState)
    return max(finalWinCounts.player1, finalWinCounts.player2)
}

private data class GameStateCount(val gameState: GameState, val count: Long)

private data class GameState(
    val player1Position: Int,
    val player2Position: Int,
    val player1Next: Boolean,
    val player1Points: Int,
    val player2Points: Int,
) {
    val hasWinner = player1Points >= 21 || player2Points >= 21

    fun getNext(diceTotal: Int): GameState {
        val nextPosition = (if (player1Next) player1Position else player2Position).let { position ->
            ((position + diceTotal) % 10).let { if (it == 0) 10 else it }
        }
        return if (player1Next) {
            GameState(nextPosition, player2Position, false, player1Points + nextPosition, player2Points)
        } else {
            GameState(player1Position, nextPosition, true, player1Points, player2Points + nextPosition)
        }
    }

    fun split(): List<GameStateCount> =
        mapOf(
            3 to 1L,
            4 to 3L,
            5 to 6L,
            6 to 7L,
            7 to 6L,
            8 to 3L,
            9 to 1L,
        ).map { (diceTotal, count) -> GameStateCount(getNext(diceTotal), count) }
}

private fun constructGameStateTransitionMap(initialGameState: GameState): Map<GameState, List<GameStateCount>> {
    val gameStateTransitionMap = mutableMapOf<GameState, List<GameStateCount>>()
    val queue = LinkedList<GameState>()
    queue.add(initialGameState)

    while (queue.isNotEmpty()) {
        val gameState = queue.poll()
        val split = gameState.split()
        gameStateTransitionMap[gameState] = split
        if (!gameState.hasWinner) {
            queue.addAll(split.map { it.gameState }
                .filterNot { gameStateTransitionMap.containsKey(it) })
        }
    }
    return gameStateTransitionMap
}

private data class WinCounts(var player1: Long, var player2: Long) {
    operator fun times(multiplier: Long) = WinCounts(player1 * multiplier, player2 * multiplier)
}

private fun constructGameStateWinCountMap(gameStateTransitionMap: Map<GameState, List<GameStateCount>>): Map<GameState, WinCounts> {
    val resolvedGames = gameStateTransitionMap.keys.filter(GameState::hasWinner).associateWith {
        WinCounts(
            if (it.player1Points > it.player2Points) 1 else 0,
            if (it.player2Points > it.player1Points) 1 else 0
        )
    }.toMutableMap()

    val queue = LinkedList(gameStateTransitionMap.keys - resolvedGames.keys)

    while (queue.isNotEmpty()) {
        val gameState = queue.poll()
        val children = gameState.split()
        if (children.all { resolvedGames.contains(it.gameState) }) {
            resolvedGames[gameState] = children
                .map { (childState, count) -> resolvedGames.getValue(childState) * count }
                .reduce { a, b -> WinCounts(a.player1 + b.player1, a.player2 + b.player2) }
        } else {
            queue.add(gameState)
        }
    }

    return resolvedGames
}
```

Two more stars in the bag.
