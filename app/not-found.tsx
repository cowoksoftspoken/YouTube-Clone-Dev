"use client";

import { CSSProperties } from "react";
import { useState } from "react";
import FuzzyText from "@/utils/FuzzyText";

export default function NotFound() {
  const [hoverIntensity] = useState(0.5);
  const [enableHover] = useState(true);

  return (
    <div style={styles.container}>
      <FuzzyText
        baseIntensity={0.2}
        hoverIntensity={hoverIntensity}
        enableHover={enableHover}
      >
        404
      </FuzzyText>
      <p style={styles.text}>Oops! Halaman yang kamu cari tidak ditemukan.</p>
    </div>
  );
}

const styles: { [key: string]: CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
  },
  text: {
    marginTop: "10px",
    fontSize: "18px",
    opacity: 0.7,
    textAlign: "center",
  },
};
