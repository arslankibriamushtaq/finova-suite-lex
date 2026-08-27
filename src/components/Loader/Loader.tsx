import "./Loader.css";
import favicon from "../../assets/images/finova-favicon.png";

/**
 * Branded full-screen loader.
 *
 * Renders the Finova mark at rest inside a rotating brand-coloured ring with
 * a soft pulsing halo over a translucent, blurred backdrop. All styling lives in
 * Loader.css (no inline styles); ring colours come from the theme tokens.
 */
const Loader = () => {
  return (
    <div className="loader">
      <div className="loader-overlay brand-loader-overlay"></div>

      <div className="brand-loader-content">
        <div className="brand-loader">
          <div className="brand-loader__halo" />
          <div className="brand-loader__ring" />
          <div className="brand-loader__ring brand-loader__ring--inner" />
          <div className="brand-loader__logo">
            <img src={favicon} alt="Loading" draggable={false} />
          </div>
        </div>
        <div className="brand-loader__text">Finova</div>
      </div>
    </div>
  );
};

export default Loader;
