---
title: "The Gilded Rose Kata - an Exercise in Refactoring"
date: "2021-01-15"
description: "The Gilded Rose is a unique code kata all about refactoring existing code. I break down my approach to solving it in JavaScript"
image: https://blog.sweller.de/images/headshot.png
---

A while ago, I heard about the Gilded Rose kata on a podcast and decided to check it out. If you're not familiar with the general concept, a code kata is a small exercise designed to practice a particular skill. Many code kata are about designing algorithms, using datastructures that are well suited to a problem, practicing certain language features and so on. The Gilded Rose is quite different as it is all about refactoring existing code.

The [original kata](https://github.com/NotMyself/GildedRose) was written in C#, but it has been [ported over](https://github.com/emilybache/GildedRose-Refactoring-Kata) to a wide variety of languages. I've long felt, there is a bit of a lack of good resources on refactoring JavaScript, so I decided to tackle the Gilded Rose in JavaScript and write about it here.

## Gilded Rose Requirements Specification

The piece of software you are asked to refactor in the Gilded Rose kata is an inventory system for a fictional shop. There is some [existing code](https://github.com/emilybache/GildedRose-Refactoring-Kata/blob/master/js-jest/src/gilded_rose.js) that meets all the [requirements](https://github.com/NotMyself/GildedRose#gilded-rose-refactoring-kata), but it's not very readable (that's a bit of an understatement as you'll come to see).

## Writing a test suite

There are some text-based tests you can use to make sure you don't break the code as you're refactoring it, but I wrote my own. This is a general best practice approach for refactoring existing code:

1. Write some tests verifying what the existing code does
2. Refactor the code, i.e. make it more readable / performant without changing the external behaviour
3. Make sure the tests still pass, so you _know_ you haven't changed the external behaviour

So with that goal in mind, here are the tests, I've written. They are somewhat repetitive, but I've extracted a function to handle most of the boilerplate.

```javascript
const { Shop, Item } = require("../src/gilded_rose");

describe(`Gilded Rose`, () => {
  describe(`regular item`, () => {
    it(`should degrade by 1 in sellIn and quality`, () => {
      verifyItemAfterUpdate(
        new Item("Elixir of the Mongoose", 10, 5),
        new Item("Elixir of the Mongoose", 9, 4)
      );
    });

    it(`should degrade in quality twice as fast once the sellBy has passed`, () => {
      verifyItemAfterUpdate(
        new Item("Elixir of the Mongoose", 0, 5),
        new Item("Elixir of the Mongoose", -1, 3)
      );
    });

    it(`should never degrade below quality 0`, () => {
      verifyItemAfterUpdate(
        new Item("Elixir of the Mongoose", 5, 0),
        new Item("Elixir of the Mongoose", 4, 0)
      );
    });
  });

  describe(`Aged Brie`, () => {
    it(`should increase in quality`, () => {
      verifyItemAfterUpdate(
        new Item("Aged Brie", 5, 0),
        new Item("Aged Brie", 4, 1)
      );
    });

    it(`should increase in quality twice as fast once the sellBy date has passed`, () => {
      verifyItemAfterUpdate(
        new Item("Aged Brie", 0, 5),
        new Item("Aged Brie", -1, 7)
      );
    });

    it(`should never have a quality above 50`, () => {
      verifyItemAfterUpdate(
        new Item("Aged Brie", 5, 50),
        new Item("Aged Brie", 4, 50)
      );
      verifyItemAfterUpdate(
        new Item("Aged Brie", 0, 49),
        new Item("Aged Brie", -1, 50)
      );
    });

    describe(`Sulfuras, Hand of Ragnaros`, () => {
      it(`should never degrade in either sellIn date or quality`, () => {
        verifyItemAfterUpdate(
          new Item("Sulfuras, Hand of Ragnaros", 5, 80),
          new Item("Sulfuras, Hand of Ragnaros", 5, 80)
        );
        verifyItemAfterUpdate(
          new Item("Sulfuras, Hand of Ragnaros", 0, 80),
          new Item("Sulfuras, Hand of Ragnaros", 0, 80)
        );
      });
    });

    describe(`Backstage passes`, () => {
      it(`should increase in quality by 1 if the sellIn date is more than 10 days away`, () => {
        verifyItemAfterUpdate(
          new Item("Backstage passes to a TAFKAL80ETC concert", 11, 10),
          new Item("Backstage passes to a TAFKAL80ETC concert", 10, 11)
        );
      });

      it(`should increase in quality by 2 if the sellIn date is 10 days or less away`, () => {
        verifyItemAfterUpdate(
          new Item("Backstage passes to a TAFKAL80ETC concert", 10, 10),
          new Item("Backstage passes to a TAFKAL80ETC concert", 9, 12)
        );
      });

      it(`should increase in quality by 3 if the sellIn date is 5 days or less away`, () => {
        verifyItemAfterUpdate(
          new Item("Backstage passes to a TAFKAL80ETC concert", 5, 10),
          new Item("Backstage passes to a TAFKAL80ETC concert", 4, 13)
        );
        verifyItemAfterUpdate(
          new Item("Backstage passes to a TAFKAL80ETC concert", 1, 10),
          new Item("Backstage passes to a TAFKAL80ETC concert", 0, 13)
        );
      });

      it(`should drop to quality 0 after the concert`, () => {
        verifyItemAfterUpdate(
          new Item("Backstage passes to a TAFKAL80ETC concert", 0, 10),
          new Item("Backstage passes to a TAFKAL80ETC concert", -1, 0)
        );
      });

      it(`should never degrade below quality 0`, () => {
        verifyItemAfterUpdate(
          new Item("Backstage passes to a TAFKAL80ETC concert", 0, 0),
          new Item("Backstage passes to a TAFKAL80ETC concert", -1, 0)
        );
      });

      it(`should never have a quality above 50`, () => {
        verifyItemAfterUpdate(
          new Item("Backstage passes to a TAFKAL80ETC concert", 15, 50),
          new Item("Backstage passes to a TAFKAL80ETC concert", 14, 50)
        );
        verifyItemAfterUpdate(
          new Item("Backstage passes to a TAFKAL80ETC concert", 5, 49),
          new Item("Backstage passes to a TAFKAL80ETC concert", 4, 50)
        );
      });
    });
  });
});

function verifyItemAfterUpdate(itemBeforeUpdate, expectedUpdatedItem) {
  const gildedRose = new Shop([itemBeforeUpdate]);
  const updatedItem = gildedRose.updateQuality()[0];
  expect(updatedItem).toEqual(expectedUpdatedItem);
}
```

## Code along

If you've gotten this far - here's my challenge to you. Fork [my fork](https://github.com/simonpweller/GildedRose-Refactoring-Kata) of the repo and have a go at refactoring the code yourself (the repo has code for all kinds of languages in it, just find the folder labelled `js-jest`). Make it as readable as you can and let me know how it turns out. I'd love to see the differences in how people approach the problem. You can use the tests to make sure you don't break anything by running `npm run test:watch`.

I will write about my own refactoring in the coming days.
