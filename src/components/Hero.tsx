import "./Hero.css";
import CategoryBar from "./CategoryBar";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__content">
        <h1 className="hero__title">
          Compare <span className="hero__underline">everything</span> with{" "}
          <span className="hero__underline">everything</span>
        </h1>
        <p className="hero__subtitle">
          Smartphones, cities, graphics cards, universities, and much more
        </p>
      </div>

      <CategoryBar />

      <div className="hero__wave" aria-hidden="true">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,64 C240,120 480,0 720,32 C960,64 1200,120 1440,64 L1440,120 L0,120 Z"
            fill="var(--hero-wave-fill)"
          />
        </svg>
      </div>
    </section>
  );
}