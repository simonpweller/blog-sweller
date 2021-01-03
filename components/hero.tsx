import React from "react";
import Image from "next/image";
import styles from "./hero.module.css";

const Hero = () => {
  return (
    <section className={styles.hero}>
      <Image
        src={"/markus-spiske-763806-unsplash.jpg"}
        layout="fill"
        objectFit="cover"
        className={styles.tonedDown}
      />
      <div className={styles.heroContent}>
        <div className="wrapper">
          <h1>Simon Weller</h1>
          <h2>Web-Developer and lifelong learner</h2>
        </div>
      </div>
    </section>
  );
};

export default Hero;
