// SkeletonLoader.js
import React from "react";
import { PulseLoader } from "react-spinners";
const SkeletonLabel = () => {
  return (

  // <div className="skeleton-loader">
  //     <div className="skeleton-label" style={{justifyContent:"end"}}></div>
  //   </div>
    <PulseLoader color="#413c3c" margin={2} size={6} speedMultiplier={0.5} />
  
  );
};

export default SkeletonLabel;
