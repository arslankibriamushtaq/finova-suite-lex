import { useLocation } from "react-router-dom";

const HeadingHeader = () => {
  // const location = window.location.pathname;
  const location = useLocation(); 
  const locationSplit = location.pathname.split("/").length>3? location.pathname.split("/")[3]:location.pathname.split("/")[2];

  return (
    <div className="service">
      <h3>{locationSplit?.replace(/([a-z])([A-Z])/g, '$1 $2')}</h3>
    </div>
  );
};

export default HeadingHeader;
