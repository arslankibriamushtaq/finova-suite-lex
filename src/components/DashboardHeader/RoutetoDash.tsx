import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";

function RoutetoDash() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/Los/Dashboard");
  }, []);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Loader />
    </div>
  );
}

export default RoutetoDash;
