import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__banner">
        <div className="hero__banner-text">
          <p className="hero__eyebrow">Best deals on wearable sensors</p>
          <h1 className="hero__title">
            Compare <span className="hero__underline">everything</span>
          </h1>
          <p className="hero__subtitle">
            Sensors, GPS trackers, cameras, and much more — up to 60% off
          </p>
        </div>
        <div className="hero__banner-art" aria-hidden="true">
          <div className="hero__blob" />
        </div>
      </div>
    </section>
  );
}
