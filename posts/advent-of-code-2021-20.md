---
title: "Advent of Code in Kotlin 2021 - Day 20"
date: "2021-12-20"
description: "My solutions to Advent of Code in Kotlin - Day 20 of 2021"
image: https://blog.sweller.de/images/advent-of-code.png
tags: adventOfCode,kotlin
---

This is part 20 of a series, so if you haven't read the previous parts, start [here](https://blog.sweller.de/posts/advent-of-code-2021-1).

For today's [puzzle](https://adventofcode.com/2021/day/20) we are given a grid of pixels and an algorithm for flipping pixels during an iteration. A pixels next state (on or off) is based on its current state and that of its neighbours.

Today looked like a bit of a breather after the grind of days 18 and 19. It was, but there was a twist, and I initially fell into the trap. The image is padded by an infinite number of pixels in the off state in every direction. In the example problem, a pixel stays off if it is off and all its neighbours are too, so it initially seems like it's enough to pad the space by 1 for each iteration. In the actual input, these pixels flip though, so the infinite space around the image flips on each iteration. After accounting for that, I ended up with a reasonably straightforward solution.

```kotlin
fun main() {
    val (algorithm, input) = inputChunks(2021, 20)
    val image = input.split(System.lineSeparator()).map { line -> line.toList() }.let(::Image)
    println(pixelCountAfterEnhancing(image, algorithm, 2))
    println(pixelCountAfterEnhancing(image, algorithm, 50))
}

private fun pixelCountAfterEnhancing(image: Image, algorithm: String, repeat: Int): Int {
    val enhancedImage = generateSequence(image) { it.enhance(algorithm) }.drop(1).take(repeat).last()
    return enhancedImage.pixels.sumOf { line -> line.count { it == '#' } }
}

private data class Image(val pixels: List<List<Char>>, val filler: Char = '.') {
    private val width = pixels.size
    private val height = pixels.first().size

    fun enhance(algorithm: String): Image {
        val expanded = expand(filler)
        val nextPixels = (0 until expanded.width).map { y ->
            (0 until expanded.height).map { x ->
                val index = Pixel(x, y).enhancePixels.map { expanded.pixelValue(it, filler) }.joinToString("").toInt(2)
                algorithm[index]
            }
        }
        return Image(
            nextPixels,
            (if (filler == '.') algorithm.first() else algorithm.last()))
    }

    private fun expand(filler: Char): Image = Image(
        listOf(List(width + 2) { filler })
            .plus(pixels.map { line -> listOf(filler) + line + listOf(filler) })
            .plus(listOf(List(width + 2) { filler }))
    )

    private fun pixelValue(pixel: Pixel, filler: Char): Int =
        pixels.getOrElse(pixel.y) { emptyList() }.getOrElse(pixel.x) { filler }
            .let { if (it == '#') 1 else 0 }
}

private data class Pixel(val x: Int, val y: Int) {
    val enhancePixels: List<Pixel>
        get() = (-1..1).flatMap { yOffset -> (-1..1).map { xOffset -> Pixel(x + xOffset, y + yOffset) } }
}
```

Two more stars in the bag.
