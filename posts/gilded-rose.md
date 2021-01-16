---
title: "The Gilded Rose Kata - an Exercise in Refactoring"
date: "2021-01-16"
description: "The Gilded Rose is a unique code kata all about refactoring existing code. I break down my approach to solving it in JavaScript"
image: https://blog.sweller.de/images/headshot.png
---

A while ago, I heard about the Gilded Rose kata on a podcast and decided to check it out. If you're not familiar with the general concept, a code kata is a small exercise designed to practice a particular skill. Many code kata are about designing algorithms, using datastructures that are well suited to a problem, practicing certain language features and so on. The Gilded Rose is quite different as it is all about refactoring existing code.

The [original kata](https://github.com/NotMyself/GildedRose) was written in C#, but it has been [ported over](https://github.com/emilybache/GildedRose-Refactoring-Kata) to a wide variety of languages. I've long felt, there is a bit of a lack of good resources on refactoring JavaScript, so I decided to tackle the Gilded Rose in JavaScript and write about it here.

## Gilded Rose Requirements Specification

The piece of software you are asked to refactor in the Gilded Rose kata is an inventory system for a fictional shop. There is some [existing code](https://github.com/emilybache/GildedRose-Refactoring-Kata/blob/master/js-jest/src/gilded_rose.js) that meets all the [requirements](https://github.com/NotMyself/GildedRose#gilded-rose-refactoring-kata), but it's not very readable (that's a bit of an understatement as you'll come to see). Your task is to add a new feature ("Conjured" items degrade in Quality twice as fast as normal items), but first the code needs to be refactored.

## Writing a test suite

There are some text-based tests you can use to make sure you don't break the code as you're refactoring it, but I wrote my own. This is a general best practice approach for refactoring existing code:

1. Write some tests verifying what the existing code does
2. Refactor the code, i.e. make it more readable / performant without changing the external behaviour
3. Make sure the tests still pass, so you _know_ you haven't changed the external behaviour

So with that goal in mind, here are the tests, I've written. They are somewhat repetitive, but I've extracted a function to handle most of the boilerplate. The last set of tests is skipped for now, since the existing code does not implement the new feature.

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

    describe.skip(`Conjured items`, () => {
      it(`should degrade by 1 in sellIn and 2 in quality`, () => {
        verifyItemAfterUpdate(
          new Item("Conjured Mana Cake", 10, 5),
          new Item("Conjured Mana Cake", 9, 3)
        );
      });

      it(`should degrade in quality twice as fast once the sellBy has passed`, () => {
        verifyItemAfterUpdate(
          new Item("Conjured Mana Cake", 0, 5),
          new Item("Conjured Mana Cake", -1, 1)
        );
      });

      it(`should never degrade below quality 0`, () => {
        verifyItemAfterUpdate(
          new Item("Conjured Mana Cake", 5, 0),
          new Item("Conjured Mana Cake", 4, 0)
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

If you've gotten this far - here's my challenge to you. Before reading any further, fork [my fork](https://github.com/simonpweller/GildedRose-Refactoring-Kata) of the repo and have a go at refactoring the code yourself (the repo has code for all kinds of languages in it, just find the folder labelled `js-jest`). Make it as readable as you can and let me know how it turns out. I'd love to see the differences in how people approach the problem. You can use the tests to make sure you don't break anything by running `npm run test:watch`.

## Simple refactorings with Webstorm

To start off with, this is what the code looks like. Pretty rough, eh?

```javascript
class Item {
  constructor(name, sellIn, quality) {
    this.name = name;
    this.sellIn = sellIn;
    this.quality = quality;
  }
}

class Shop {
  constructor(items = []) {
    this.items = items;
  }

  updateQuality() {
    for (let i = 0; i < this.items.length; i++) {
      if (
        this.items[i].name !== "Aged Brie" &&
        this.items[i].name !== "Backstage passes to a TAFKAL80ETC concert"
      ) {
        if (this.items[i].quality > 0) {
          if (this.items[i].name !== "Sulfuras, Hand of Ragnaros") {
            this.items[i].quality = this.items[i].quality - 1;
          }
        }
      } else {
        if (this.items[i].quality < 50) {
          this.items[i].quality = this.items[i].quality + 1;
          if (
            this.items[i].name === "Backstage passes to a TAFKAL80ETC concert"
          ) {
            if (this.items[i].sellIn < 11) {
              if (this.items[i].quality < 50) {
                this.items[i].quality = this.items[i].quality + 1;
              }
            }
            if (this.items[i].sellIn < 6) {
              if (this.items[i].quality < 50) {
                this.items[i].quality = this.items[i].quality + 1;
              }
            }
          }
        }
      }
      if (this.items[i].name !== "Sulfuras, Hand of Ragnaros") {
        this.items[i].sellIn = this.items[i].sellIn - 1;
      }
      if (this.items[i].sellIn < 0) {
        if (this.items[i].name !== "Aged Brie") {
          if (
            this.items[i].name !== "Backstage passes to a TAFKAL80ETC concert"
          ) {
            if (this.items[i].quality > 0) {
              if (this.items[i].name !== "Sulfuras, Hand of Ragnaros") {
                this.items[i].quality = this.items[i].quality - 1;
              }
            }
          } else {
            this.items[i].quality =
              this.items[i].quality - this.items[i].quality;
          }
        } else {
          if (this.items[i].quality < 50) {
            this.items[i].quality = this.items[i].quality + 1;
          }
        }
      }
    }

    return this.items;
  }
}

module.exports = {
  Item,
  Shop,
};
```

I like to use an editor called Webstorm. It's not free, but it has great refactoring tools built in. Let me show you a few of them. `this.items[i]` is repeated all over the place, let's clean that up by converting the for-loop to using forEach on the items. Much better!

<img src="/images/convertForToForEach.gif" alt="Gif showing editor support for refactoring a for-loop to forEach" />

Here' another example - excessive negation is generally not a great idea. So let's use 'flip if-else' and 'Replace && with ||' to make the logic a bit more apparent. The neat thing about these automatic refactorings is that they are "safe" i.e. Webstorm will not offer them to you unless they maintain the existing behaviour.

<img src="/images/flipBooleans.gif" alt="Gif showing editor support for 'flip if-else' and 'Replace && with ||'" />

Next we'll use a mixture of manual and automatic changes to align that part of the code to a common structure, where each branch is executed for one name. After doing this, here's where we end up:

```javascript
function updateQuality() {
  this.items.forEach((item) => {
    if (item.name === "Aged Brie") {
      if (item.quality < 50) {
        item.quality = item.quality + 1;
      }
    } else if (item.name === "Backstage passes to a TAFKAL80ETC concert") {
      if (item.quality < 50) {
        item.quality = item.quality + 1;
        if (item.sellIn < 11 && item.quality < 50) {
          item.quality = item.quality + 1;
        }
        if (item.sellIn < 6 && item.quality < 50) {
          item.quality = item.quality + 1;
        }
      }
    } else if (item.name === "Sulfuras, Hand of Ragnaros") {
    } else {
      if (item.quality > 0) {
        item.quality = item.quality - 1;
      }
    }
    if (item.name !== "Sulfuras, Hand of Ragnaros") {
      item.sellIn = item.sellIn - 1;
    }
    if (item.sellIn < 0) {
      if (item.name !== "Aged Brie") {
        if (item.name !== "Backstage passes to a TAFKAL80ETC concert") {
          if (item.quality > 0) {
            if (item.name !== "Sulfuras, Hand of Ragnaros") {
              item.quality = item.quality - 1;
            }
          }
        } else {
          item.quality = item.quality - item.quality;
        }
      } else {
        if (item.quality < 50) {
          item.quality = item.quality + 1;
        }
      }
    }
  });

  return this.items;
}
```

## Early returns

Let's switch gears a bit and look at the bigger picture. There are quite a few places in the code where we check that the item in question isn't 'Sulfuras, Hand of Ragnaros' because that item should never decay. We can simplify the code significantly by simply returning immediately for that item. Nice!

Note: updateQuality is still a method on the Shop class, I'm just showing it as a function here to save some space.

```javascript
function updateQuality() {
  this.items.forEach((item) => {
    if (item.name === "Sulfuras, Hand of Ragnaros") return;

    if (item.name === "Aged Brie") {
      if (item.quality < 50) {
        item.quality = item.quality + 1;
      }
    } else if (item.name === "Backstage passes to a TAFKAL80ETC concert") {
      if (item.quality < 50) {
        item.quality = item.quality + 1;
        if (item.sellIn < 11 && item.quality < 50) {
          item.quality = item.quality + 1;
        }
        if (item.sellIn < 6 && item.quality < 50) {
          item.quality = item.quality + 1;
        }
      }
    } else {
      if (item.quality > 0) {
        item.quality = item.quality - 1;
      }
    }

    item.sellIn = item.sellIn - 1;

    if (item.sellIn < 0) {
      if (item.name !== "Aged Brie") {
        if (item.name !== "Backstage passes to a TAFKAL80ETC concert") {
          if (item.quality > 0) {
            item.quality = item.quality - 1;
          }
        } else {
          item.quality = item.quality - item.quality;
        }
      } else {
        if (item.quality < 50) {
          item.quality = item.quality + 1;
        }
      }
    }
  });

  return this.items;
}
```

## Extracting helper functions

There is a recurring pattern in that code, where we check if quality is below 50 before incrementing it or above 0 before decrementing it. This is necessary to ensure quality always stays between 0 and 50, but we can make it more expressive by building a couple of helper functions for it and giving them expressive names. In an ideal world, we'd define these functions on the item class, but unfortunately the rules of the kata don't allow for making changes to that class!

```javascript
function decrementQualityDownTo0(item) {
  if (item.quality > 0) {
    item.quality = item.quality - 1;
  }
}

function incrementQualityUpTo50(item) {
  if (item.quality < 50) {
    item.quality = item.quality + 1;
  }
}
```

When putting these functions to use, it pays to go very slowly to avoid making mistakes. For example, say you have this code:

```javascript
if (item.quality > 0) {
  item.quality = item.quality - 1;
}
```

We can first add the call to the helper function and make sure the tests still pass.

```javascript
if (item.quality > 0) {
  decrementQualityDownTo0(item);
}
```

If the tests are green, we can now remove the guard clause.

```javascript
decrementQualityDownTo0(item);
```

This might seem excessive at first, but once you get used to it, this approach works great. I learned about it in the fantastic book [99 bottles of OOP](https://sandimetz.com/99bottles). If you haven't read it - go check it out!

After doing this everywhere, we end up with this:

```javascript
function updateQuality() {
  this.items.forEach((item) => {
    if (item.name === "Sulfuras, Hand of Ragnaros") return;

    if (item.name === "Aged Brie") {
      this.incrementQualityUpTo50(item);
    } else if (item.name === "Backstage passes to a TAFKAL80ETC concert") {
      this.incrementQualityUpTo50(item);
      if (item.sellIn < 11) this.incrementQualityUpTo50(item);
      if (item.sellIn < 6) this.incrementQualityUpTo50(item);
    } else {
      this.decrementQualityDownTo0(item);
    }

    item.sellIn = item.sellIn - 1;

    if (item.sellIn < 0) {
      if (item.name !== "Aged Brie") {
        if (item.name !== "Backstage passes to a TAFKAL80ETC concert") {
          this.decrementQualityDownTo0(item);
        } else {
          item.quality = item.quality - item.quality;
        }
      } else {
        this.incrementQualityUpTo50(item);
      }
    }
  });

  return this.items;
}
```

By inverting negated if clauses and doing some reordering we can tidy up the third chunk of code to this:

```javascript
if (item.sellIn < 0) {
  if (item.name === "Backstage passes to a TAFKAL80ETC concert") {
    item.quality = 0;
  } else if (item.name === "Aged Brie") {
    this.incrementQualityUpTo50(item);
  } else {
    this.decrementQualityDownTo0(item);
  }
}
```

## Shifting item-specific logic to a single place

What we're left with at this point are two blocks incrementing or decrementing the quality, separated by decrementing the sellIn. Let's reorder them, so we can merge the two long if statements. First, we'll swap the last two blocks. Since we're now decrementing the sellIn date _after_ the second round of incrementing / decrementing the quality, we need to check if the sellIn is equal to 0 rather than below 0.

```javascript
function updateQuality() {
  this.items.forEach((item) => {
    if (item.name === "Sulfuras, Hand of Ragnaros") return;

    if (item.name === "Aged Brie") {
      this.incrementQualityUpTo50(item);
    } else if (item.name === "Backstage passes to a TAFKAL80ETC concert") {
      this.incrementQualityUpTo50(item);
      if (item.sellIn < 11) this.incrementQualityUpTo50(item);
      if (item.sellIn < 6) this.incrementQualityUpTo50(item);
    } else {
      this.decrementQualityDownTo0(item);
    }

    if (item.sellIn === 0) {
      if (item.name === "Backstage passes to a TAFKAL80ETC concert") {
        item.quality = 0;
      } else if (item.name === "Aged Brie") {
        this.incrementQualityUpTo50(item);
      } else {
        this.decrementQualityDownTo0(item);
      }
    }

    item.sellIn = item.sellIn - 1;
  });
}
```

Now we can merge the long if statements. This won't look much better than before, but it'll set us up nicely for the next refactoring.

```javascript
function updateQuality() {
  this.items.forEach((item) => {
    if (item.name === "Sulfuras, Hand of Ragnaros") return;

    if (item.name === "Aged Brie") {
      this.incrementQualityUpTo50(item);
      if (item.sellIn === 0) {
        this.incrementQualityUpTo50(item);
      }
    } else if (item.name === "Backstage passes to a TAFKAL80ETC concert") {
      this.incrementQualityUpTo50(item);
      if (item.sellIn < 11) this.incrementQualityUpTo50(item);
      if (item.sellIn < 6) this.incrementQualityUpTo50(item);
      if (item.sellIn === 0) item.quality = 0;
    } else {
      this.decrementQualityDownTo0(item);
      if (item.sellIn === 0) {
        this.decrementQualityDownTo0(item);
      }
    }

    item.sellIn = item.sellIn - 1;
  });

  return this.items;
}
```

It's clear now that we really increment / decrement quality by varying amounts (determined based on the item name and sell in date). Let's work on our helpers, so they can take in the amount as a parameter. First, let's change them to use Math.max and Math.min instead of the if logic (I list only the increment method here since they are very similar).

```javascript
function incrementQualityUpTo50(item) {
  item.quality = Math.min(item.quality + 1, 50);
}
```

Now we can add an amount parameter with a default value of 1, so it still works with the rest of our code. We'll adjust the name accordingly.

```javascript
function increaseQualityUpTo50(item, amount = 1) {
  item.quality = Math.min(item.quality + amount, 50);
}
```

We can now use these helpers like this:

```javascript
function updateQuality() {
  this.items.forEach((item) => {
    if (item.name === "Sulfuras, Hand of Ragnaros") return;

    if (item.name === "Aged Brie") {
      this.increaseQualityUpTo50(item, item.sellIn === 0 ? 2 : 1);
    } else if (item.name === "Backstage passes to a TAFKAL80ETC concert") {
      let qualityIncrease = 1;
      if (item.sellIn < 11) qualityIncrease = 2;
      if (item.sellIn < 6) qualityIncrease = 3;
      this.increaseQualityUpTo50(item, qualityIncrease);
      if (item.sellIn === 0) item.quality = 0;
    } else {
      this.decreaseQualityDownTo0(item, item.sellIn === 0 ? 2 : 1);
    }

    item.sellIn = item.sellIn - 1;
  });

  return this.items;
}
```

Pulling out a couple more helpers could help readability further, so let's do that.

```javascript
function updateQuality() {
  this.items.forEach((item) => {
    if (item.name === "Sulfuras, Hand of Ragnaros") return;

    if (item.name === "Aged Brie") {
      this.increaseQualityUpTo50(item, this.isExpired(item) ? 2 : 1);
    } else if (item.name === "Backstage passes to a TAFKAL80ETC concert") {
      this.increaseQualityUpTo50(
        item,
        this.getBackstagePassesQualityIncrease(item.sellIn)
      );
      if (item.sellIn === 0) item.quality = 0;
    } else {
      this.decreaseQualityDownTo0(item, this.isExpired(item) ? 2 : 1);
    }

    item.sellIn = item.sellIn - 1;
  });

  return this.items;
}

function isExpired(item) {
  return item.sellIn <= 0;
}

function getBackstagePassesQualityIncrease(sellIn) {
  let qualityIncrease = 1;
  if (sellIn < 11) qualityIncrease = 2;
  if (sellIn < 6) qualityIncrease = 3;
  return qualityIncrease;
}
```

It bothers me that increaseQualityUpTo50 and decreaseQualityDownTo0 have a side effect (they change the value of item.quality outside the function), so let's change that.

```javascript
class Shop {
  constructor(items = []) {
    this.items = items;
  }

  updateQuality() {
    this.items.forEach((item) => {
      if (item.name === "Sulfuras, Hand of Ragnaros") return;

      if (item.name === "Aged Brie") {
        item.quality = this.qualityIncreasedUpTo50(
          item,
          this.isExpired(item) ? 2 : 1
        );
      } else if (item.name === "Backstage passes to a TAFKAL80ETC concert") {
        item.quality = this.qualityIncreasedUpTo50(
          item,
          this.getBackstagePassesQualityIncrease(item.sellIn)
        );
        if (item.sellIn === 0) item.quality = 0;
      } else {
        item.quality = this.qualityDecreasedDownTo0(
          item,
          this.isExpired(item) ? 2 : 1
        );
      }

      item.sellIn = item.sellIn - 1;
    });

    return this.items;
  }

  isExpired(item) {
    return item.sellIn <= 0;
  }

  getBackstagePassesQualityIncrease(sellIn) {
    let qualityIncrease = 1;
    if (sellIn < 11) qualityIncrease = 2;
    if (sellIn < 6) qualityIncrease = 3;
    return qualityIncrease;
  }

  qualityDecreasedDownTo0(item, amount = 1) {
    return Math.max(item.quality - amount, 0);
  }

  qualityIncreasedUpTo50(item, amount = 1) {
    return Math.min(item.quality + amount, 50);
  }
}
```

Now we can set up a general getNextQuality helper based on a switch statement with a return for each case. I find JavaScript switch statements a bit clunky due to the need to always break out of each case, but returning gets around that nicely.

```javascript
function updateQuality() {
  this.items.forEach((item) => {
    if (item.name === "Sulfuras, Hand of Ragnaros") return;
    item.quality = this.getNextQuality(item);
    item.sellIn = item.sellIn - 1;
  });

  return this.items;
}

function getNextQuality(item) {
  switch (item.name) {
    case "Sulfuras, Hand of Ragnaros":
      return item.quality;
    case "Aged Brie":
      return this.qualityIncreasedUpTo50(item, this.isExpired(item) ? 2 : 1);
    case "Backstage passes to a TAFKAL80ETC concert":
      if (item.sellIn === 0) return 0;
      return this.qualityIncreasedUpTo50(
        item,
        this.getBackstagePassesQualityIncrease(item.sellIn)
      );
    default:
      return this.qualityDecreasedDownTo0(item, this.isExpired(item) ? 2 : 1);
  }
}
```

## Finishing touches

I think that leaves us in a pretty good place. There are some gaps in symmetry still, so I have pulled out getNextSellIn and inlined the calculation of the next quality for backstage passes. So the final result looks like this:

```javascript
class Shop {
  constructor(items = []) {
    this.items = items;
  }

  updateQuality() {
    this.items = this.items.map((item) => {
      return {
        ...item,
        sellIn: this.getNextSellIn(item),
        quality: this.getNextQuality(item),
      };
    });

    return this.items;
  }

  getNextSellIn(item) {
    switch (item.name) {
      case "Sulfuras, Hand of Ragnaros":
        return item.sellIn;
      default:
        return item.sellIn - 1;
    }
  }

  getNextQuality(item) {
    switch (item.name) {
      case "Sulfuras, Hand of Ragnaros":
        return item.quality;
      case "Aged Brie":
        return this.qualityIncreasedUpTo50(item, this.isExpired(item) ? 2 : 1);
      case "Backstage passes to a TAFKAL80ETC concert":
        if (this.isExpired(item)) {
          return 0;
        } else if (item.sellIn > 10) {
          return this.qualityIncreasedUpTo50(item, 1);
        } else if (item.sellIn > 5) {
          return this.qualityIncreasedUpTo50(item, 2);
        } else {
          return this.qualityIncreasedUpTo50(item, 3);
        }
      default:
        return this.qualityDecreasedDownTo0(item, this.isExpired(item) ? 2 : 1);
    }
  }

  isExpired(item) {
    return item.sellIn <= 0;
  }

  qualityDecreasedDownTo0(item, amount = 1) {
    return Math.max(item.quality - amount, 0);
  }

  qualityIncreasedUpTo50(item, amount = 1) {
    return Math.min(item.quality + amount, 50);
  }
}
```

I'm reasonably happy with that. You can easily read it top to bottom, and the business logic is largely captured in a single switch statement. If you're interested in another perspective, I recommend you watch this excellent [video](https://www.youtube.com/watch?v=8bZh5LMaSmE) by Sandy Metz. I have chosen a slightly different approach, because I think co-locating the switch with the quality update logic makes it easier to quickly understand how the system behaves without having to jump between classes.

Before we go, we need to implement the new feature - Conjured items. Fortunately, that's easy now. We just add another case. Nice!

```javascript
function getNextQuality(item) {
  switch (item.name) {
    case "Sulfuras, Hand of Ragnaros":
      return item.quality;
    case "Aged Brie":
      return this.qualityIncreasedUpTo50(item, this.isExpired(item) ? 2 : 1);
    case "Backstage passes to a TAFKAL80ETC concert":
      if (this.isExpired(item)) {
        return 0;
      } else if (item.sellIn > 10) {
        return this.qualityIncreasedUpTo50(item, 1);
      } else if (item.sellIn > 5) {
        return this.qualityIncreasedUpTo50(item, 2);
      } else {
        return this.qualityIncreasedUpTo50(item, 3);
      }
    case "Conjured Mana Cake":
      return this.qualityDecreasedDownTo0(item, this.isExpired(item) ? 4 : 2);
    default:
      return this.qualityDecreasedDownTo0(item, this.isExpired(item) ? 2 : 1);
  }
}
```

What do you think? Would you do something differently? Did you learn something?
