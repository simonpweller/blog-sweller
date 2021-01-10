---
title: "Building a memory game with React and TypeScript"
date: "2021-01-10"
description: "On weekend mornings, I sometimes build little JavaScript games with my son. In this post, I break down how to build a simple memory game with React."
image: https://blog.sweller.de/images/fox-memory.jpg
---

On the weekend, I sometimes build little JavaScript games with my son. He's 5, so I write the code while he pitches in ideas, makes decisions about the design and play-tests the game. It can be a bit stressful, but it really helps with analysis-paralysis!

This weekend, we worked on a simple game of memory. For extra fun, you can have your kid(s) draw the images and scan the in. If you don't have kids, you can always draw your own, take landscape photographs - whatever is fun for you. If you're not feeling super creative, just head over to [unsplash](https://unsplash.com/) and grab some cute pictures - that's what I did here.

<picture>
  <source type="image/webp" srcset="/images/fox-memory.webp">
  <img src="/images/fox-memory.jpg" alt="A memory game with fox pictures">
</picture>

## A game of memory

So what's involved in a game of memory? We want a grid of cards with images in a random order, using each image twice. I am using lodash.shuffle here, but you can of course write your own shuffle function.

```typescript
import shuffle from "lodash.shuffle";
import image1 from "./images/1.jpg";
import image2 from "./images/2.jpg";
import image3 from "./images/3.jpg";
import image4 from "./images/4.jpg";
import image5 from "./images/5.jpg";
import image6 from "./images/6.jpg";

export const getShuffledImages = (): string[] => {
  const images = [image1, image2, image3, image4, image5, image6];
  return shuffle([...images, ...images]);
};
```

We'll use these images in the App component to populate a grid of cards. Laying them out into rows is done with css, so the grid is responsive. To avoid changing the order of the image on every render, we wrap the result in a `useState` hook.

```typescript jsx
import React, { useState } from "react";
import { getShuffledImages } from "./images";
import { Card } from "./Card";

const App = () => {
  const [images] = useState(getShuffledImages());

  return (
    <div className="app">
      <div className="board">
        {images.map((image, index) => (
          <Card key={index} image={images[index]} />
        ))}
      </div>
    </div>
  );
};

export default App;
```

The card component just renders out the image for now.

```typescript jsx
import React from "react";

export const Card = ({ image }: { image: string }) => (
  <div className="card">
    <img
      src={image}
      alt="A cute fox"
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  </div>
);
```

## Making things interactive

As it is, all the images are visible and there's no way to actually play the game, so we still have some work to do. Let's add some logic to make the cards flippable. They'll still be dumb components, so we'll just pass in the necessary props. If a card is not flipped, we just set the image width and height to 0. That way it is still downloaded up front.

```typescript jsx
import React from "react";
import cover from "./images/cover.jpg";

export const Card = ({
  image,
  isFlipped,
  flip,
}: {
  image: string;
  isFlipped: boolean;
  flip: () => void;
}) => (
  <div className="card" onClick={flip}>
    <img
      src={image}
      alt="A cute fox"
      style={
        isFlipped
          ? { width: "100%", height: "100%", objectFit: "cover" }
          : { width: 0, height: 0 }
      }
    />
  </div>
);
```

We could put the logic for managing the state of the cards into the app component, but I prefer creating a custom hook to encapsulate that logic. We are setting up an array of booleans here and toggling them when a card is flipped. If a player tries to flip a card that's already flipped, we just return early.

```typescript
import { useState } from "react";
import { getShuffledImages } from "./images";

function useCards(): {
  images: string[];
  cardsFlipped: boolean[];
  flip: (indexToFlip: number) => void;
} {
  const [images] = useState(getShuffledImages());
  const [cardsFlipped, setCardsFlipped] = useState(images.map(() => false));

  const flip = (indexToFlip: number) => {
    if (cardsFlipped[indexToFlip]) return;

    const nextCards = [...cardsFlipped];
    nextCards[indexToFlip] = !nextCards[indexToFlip];
    setCardsFlipped(nextCards);
  };

  return { images, cardsFlipped, flip };
}

export default useCards;
```

Now the App component can just use the interface that hook exposes.

```typescript jsx
import React from "react";
import { Card } from "./Card";
import useCards from "./useCards";

const App = () => {
  const {
    images,
    cardsFlipped,
    flip,
  }: {
    images: string[];
    cardsFlipped: boolean[];
    flip: (indexToFlip: number) => void;
  } = useCards();

  return (
    <div className="app">
      <div className="board">
        {images.map((image, index) => (
          <Card
            key={index}
            image={images[index]}
            isFlipped={cardsFlipped[index]}
            flip={() => flip(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
```

## Rules of the game

With this, we can flip cards over, but they should flip back if we don't get a match. Let's do that inside our custom hook. We just need a new piece of state to store the index of the first flipped card. When a second card is flipped and there is no match, we flip both cards back.

```typescript
import { useState } from "react";
import { getShuffledImages } from "./images";

const useCards = () => {
  const [images] = useState(getShuffledImages());
  const [cardsFlipped, setCardsFlipped] = useState(images.map(() => false));
  const [firstIndex, setFirstIndex] = useState<number | null>(null);

  const flip = (indexToFlip: number) => {
    if (cardsFlipped[indexToFlip]) return;

    const nextCards = [...cardsFlipped];
    nextCards[indexToFlip] = !nextCards[indexToFlip];

    if (firstIndex !== null && images[indexToFlip] !== images[firstIndex]) {
      nextCards[indexToFlip] = false;
      nextCards[firstIndex] = false;
    }
    setFirstIndex(firstIndex === null ? indexToFlip : null);
    setCardsFlipped(nextCards);
  };

  return { images, cardsFlipped, flip };
};

export default useCards;
```

We have a working game now, but there is still one problem remaining. When we flip cards back because there is no match, we don't actually give the player a chance to see the picture on the first card first. Let's fix that.

```typescript
import { useState } from "react";
import { getShuffledImages } from "./images";

const useCards = () => {
  const [images] = useState(getShuffledImages());
  const [cardsFlipped, setCardsFlipped] = useState(images.map(() => false));
  const [firstIndex, setFirstIndex] = useState<number | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  const flip = (indexToFlip: number) => {
    if (isDisabled || cardsFlipped[indexToFlip]) return;

    const nextCards = [...cardsFlipped];
    nextCards[indexToFlip] = !nextCards[indexToFlip];
    setCardsFlipped(nextCards);

    if (firstIndex !== null && images[indexToFlip] !== images[firstIndex]) {
      flipBack(firstIndex, indexToFlip);
    }

    setFirstIndex(firstIndex === null ? indexToFlip : null);
  };

  const flipBack = (firstIndex: number, secondIndex: number) => {
    setIsDisabled(true);
    setTimeout(() => {
      const nextCards = [...cardsFlipped];
      nextCards[firstIndex] = false;
      nextCards[secondIndex] = false;
      setCardsFlipped(nextCards);
      setIsDisabled(false);
    }, 750);
  };

  return { images, cardsFlipped, flip };
};

export default useCards;
```

Flipping the cards back now happens in a separate function, delayed by 750 milliseconds. To make sure the player can't keep flipping cards in the meantime, we set a isDisabled flag and only set it back to false when the cards are flipped back.

That's it - you can check out the full code on [github](https://github.com/simonpweller/simple-memory-game) or try out a [demo](https://remember-the-fox.netlify.app/) of the game.
