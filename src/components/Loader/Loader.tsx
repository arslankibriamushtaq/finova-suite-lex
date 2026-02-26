import { PropagateLoader } from "react-spinners";

const Loader = () => {
  const loaderText = [
    "A",
    "W",
    "N",
    " ",
    " ",
    "F",
    "I",
    "N",
    "A",
    "N",
    "C",
    "I",
    "N",
    "G",
  ];

  return (
    <div className="loader">
      <div className="loader-overlay"></div>
      {/* <div className="loader-content">
        <div className="loader-container col-md-12 col-10">
          {loaderText.map((letter, index) => (
            <div key={`wave-${index}`} className="wave">
              {letter}
            </div>
          ))}
        </div>
      </div> */}
      <PropagateLoader color="#000000" />
    </div>
  );
};

export default Loader;
