import { useEffect, useState } from "react";
import { PropagateLoader } from "react-spinners";

const Loader = () => {
  // Track the active theme so PropagateLoader gets a concrete colour value
  // (react-spinners forwards `color` into inline SVG fills, which don't
  // resolve CSS variables on all engines).
  const isDark = () =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  const [color, setColor] = useState<string>(isDark() ? "#ffffff" : "#0f172a");

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setColor(isDark() ? "#ffffff" : "#0f172a");
    });
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="loader">
      <div className="loader-overlay"></div>
      <div
        className="loader-dots"
        style={{ position: "relative", zIndex: 2 }}
      >
        <PropagateLoader color={color} />
      </div>
    </div>
  );
};

export default Loader;
