---
title: "Advent of Code in Kotlin 2021 - Day 16"
date: "2021-12-16"
description: "My solutions to Advent of Code in Kotlin - Day 16 of 2021"
image: https://blog.sweller.de/images/advent-of-code.png
tags: adventOfCode,kotlin
---

This is part 16 of a series, so if you haven't read the previous parts, start [here](https://blog.sweller.de/posts/advent-of-code-2021-1).

For today's [puzzle](https://adventofcode.com/2021/day/16) we are given a data package as binary data encoded in hex. Each package contains either a literal value or contains subpackages and an operation that should be performed on them. The challenge is mainly in parsing the packages.

I was a bit worried seeing the times on the leaderboard, but it actually didn't take me too long - just went through the requirements at a steady pace without making any costly mistakes. Not much time to clean up the code, but I'm feeling ok about it.

```kotlin
fun main() {
    val binary = inputText(2021, 16).toBinary()
    val topLevelPacket = parse(binary).packet
    println(topLevelPacket.totalVersionIds)
    println(topLevelPacket.value)
}

private fun parse(binary: String): ParseResult {
    var remaining = binary

    val version = remaining.take(3).toInt(2).also { remaining = remaining.drop(3) }
    val typeId = remaining.take(3).toInt(2).also { remaining = remaining.drop(3) }

    if (typeId == 4) {
        var tempNumber = ""
        while (remaining.first() == '1') {
            tempNumber += remaining.drop(1).take(4)
            remaining = remaining.drop(5)
        }
        tempNumber += remaining.drop(1).take(4)
        remaining = remaining.drop(5)
        return ParseResult(LiteralPacket(version, typeId, tempNumber.toLong(2)), remaining)
    } else {
        val subPackets = mutableListOf<Packet>()
        val lengthType = remaining.take(1).toInt(2).also { remaining = remaining.drop(1) }
        if (lengthType == 0) {
            val length = remaining.take(15).toInt(2).also { remaining = remaining.drop(15) }
            var subPacketBinary = remaining.take(length).also { remaining = remaining.drop(length) }
            while (subPacketBinary.isNotEmpty()) {
                val (subPacket, remainingSubPacketBinary) = parse(subPacketBinary)
                subPacketBinary = remainingSubPacketBinary
                subPackets.add(subPacket)
            }
        } else {
            val subPacketCount = remaining.take(11).toInt(2).also { remaining = remaining.drop(11) }
            while (subPackets.size < subPacketCount) {
                val (subPacket, nextRemaining) = parse(remaining)
                remaining = nextRemaining
                subPackets.add(subPacket)
            }
        }
        return ParseResult(OperatorPacket(version, typeId, subPackets), remaining)
    }
}

private data class ParseResult(val packet: Packet, val remaining: String)

private interface Packet {
    val totalVersionIds: Int
    val value: Long
}

private data class LiteralPacket(val version: Int, val typeId: Int, override val value: Long): Packet {
    override val totalVersionIds: Int
        get() = version
}

private data class OperatorPacket(val version: Int, val typeId: Int, val subPackets: List<Packet>): Packet {
    override val totalVersionIds: Int
        get() = version + subPackets.sumOf { it.totalVersionIds }
    override val value: Long
        get() {
            return when(typeId) {
                0 -> this.subPackets.map { it.value }.reduce { a, b -> a + b}
                1 -> this.subPackets.map { it.value }.reduce { a, b -> a * b}
                2 -> min(this.subPackets.map { it.value })
                3 -> max(this.subPackets.map { it.value })
                5 -> if (this.subPackets.first().value > this.subPackets.last().value) 1 else 0
                6 -> if (this.subPackets.first().value < this.subPackets.last().value) 1 else 0
                7 -> if (this.subPackets.first().value == this.subPackets.last().value) 1 else 0
                else -> throw IllegalArgumentException("Unknown operator $typeId")
            }
        }
}

private fun Char.toBinary() = this.toString().toInt(16).toString(2).padStart(4, '0')
private fun String.toBinary() = this.map(Char::toBinary).joinToString("")
```

Two more stars in the bag.
