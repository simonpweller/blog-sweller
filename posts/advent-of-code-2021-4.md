---
title: "Advent of Code in Kotlin 2021 - Day 4"
date: "2021-12-04"
description: "My solutions to Advent of Code in Kotlin - Day 4 of 2021"
image: https://blog.sweller.de/images/advent-of-code.png
tags: adventOfCode,kotlin
---

This is part 4 of a series, so if you haven't read the previous parts, start [here](https://blog.sweller.de/posts/advent-of-code-2021-1).

Today's [puzzle](https://adventofcode.com/2021/day/4) has you simulating a game of bingo against a giant squid. You are given a list of numbers and a set of boards.

For part 1 you have to determine the first board to win and calculate a score by taking the sum of all unmarked numbers on that board and multiplying it by the final number. Part 2 asks for the score of the last board to win.

The first order of business is parsing the data into a structure. I already have a helper that parses chunks separated by a blank line, so I use that here.

```kotlin
fun main() {
    val input = inputChunks(2021, 4)
    val numbers = input.first().split(",").map(String::toInt)
    val boards = input.drop(1)
        .map {
            it
                .split(System.lineSeparator())
                .map { row -> row.split(" ").filter(String::isNotBlank).map(String::toInt) }
        }
        .map(::BingoBoard)
}
```

In the BingoBoard class, I store the count of marked numbers in each row / column in an array. For checking if the board is complete, I only need the count of marked numbers, not the numbers themselves. I also store the position of each number in a map.

This allows the markNumber function to know which counts to update without having to iterate over the board. Once one of the counts reaches 5 (the size of the board), it will be marked as complete.

```kotlin
private class BingoBoard(private val rows: List<List<Int>>) {
    var isComplete: Boolean = false
    val numRows = rows.size
    val numCols = rows.first().size
    private val markedNumbers = mutableSetOf<Int>()

    private val numPositions = rows.flatMapIndexed { rowIndex, row ->
        row.mapIndexed { colIndex, num ->
            num to Pair(rowIndex, colIndex)
        }
    }.toMap()

    val unmarkedNumbers: List<Int>
        get() = rows.flatten().minus(markedNumbers)

    private val markedRows = MutableList(numRows) { 0 }
    private val markedCols = MutableList(numCols) { 0 }

    fun markNumber(number: Int) {
        markedNumbers.add(number)
        val (row, col) = numPositions[number] ?: return
        markedRows[row] = markedRows[row] + 1
        markedCols[col] = markedCols[col] + 1
        if (markedRows[row] == numRows || markedCols[col] == numCols) isComplete = true
    }
}
```

Now we can iterate over the numbers, updating each board as we go (skipping completed boards). When a board is completed we record the score. This seemed more convenient than iterating over a full board before moving on to the next since it means we get the scores in the right order.

```kotlin
private fun getScores(boards: List<BingoBoard>, numbers: List<Int>): List<Int> {
    var scores = emptyList<Int>()
    numbers.forEach { number ->
        boards.forEach { board ->
            if (!board.isComplete) {
                board.markNumber(number)
                if (board.isComplete) {
                    scores = scores + board.unmarkedNumbers.sum() * number
                }
            }
        }
    }
    return scores
}
```

All that's left is to calculate all the scores, which gives us the answer for both part 1 and part 2.

```kotlin
fun main() {
    val input = inputChunks(2021, 4)
    val numbers = input.first().split(",").map(String::toInt)
    val boards = input.drop(1)
        .map {
            it
                .split(System.lineSeparator())
                .map { row -> row.split(" ").filter(String::isNotBlank).map(String::toInt) }
        }
        .map(::BingoBoard)

    val scores = getScores(boards, num``bers)
    println(scores.first())
    println(scores.last())
}
```

Hacking together an answer for this one was reasonably quick, but it took a little while to polish it into something reasonably efficient. It wasn't really necessary since it's only day 4 and the input is quite small, but if experience is anything to go by later days won't be quite as forgiving.
