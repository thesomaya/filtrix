import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";

export default function Hero() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const params = query.trim() ? `?search=${encodeURIComponent(query.trim())}` : "";
    navigate(`/products${params}`);
  }

  return (
    <section className="hero">
      <div className="hero__banner">
        <h1 className="hero__title">
          Choose the <span className="hero__underline">right product for you</span>
        </h1>

        <p className="hero__subtitle">
          GPS trackers, asset trackers, OBD devices, and more
        </p>

        <form className="hero__search" onSubmit={handleSearch}>
          <span className="hero__search-icon" aria-hidden="true">
            🔍
          </span>
          <input
            type="text"
            className="hero__search-input"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="hero__search-btn">
            Search
          </button>
        </form>
      </div>
    </section>
  );
}