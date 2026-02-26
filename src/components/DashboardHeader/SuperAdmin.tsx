import { Images } from "../Config/Images";
import { FaUserAlt, FaSignOutAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { RootState } from "../../redux/rootReducer";
import { useSelector } from "react-redux";

const AdminModal = () => {
  const themeBuilder = useSelector((state: RootState) => state.block.theme);
  const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;
  const Overlay = styled.div`
    background: ${themeBuilder.backgroundOne};
    background: ${themeBuilder.backgroundTwo};
    background-size: 400% 400%;
    color: #ffffff;
    position: relative;
    height: 100%;
    width: 100%;
    display: flex;
    transform: translateX(0);
    transition: transform 0.6s ease-in-out;
    animation: ${gradientAnimation} 10s ease infinite;
    -webkit-animation: ${gradientAnimation} 10s ease infinite;
    border-radius: 0px 0px 0px 0px;
    align-items: center;
  `;
  return (
    <>
      <div className="login-form-data">
        <div className="d-flex justify-content-start align-items-center">
          <Overlay>
            <div className="p-3">
              <img src={Images.profileUser} className="profile-logo" />
            </div>
            <div>
              <h4 className="mb-0 text-white fs-16">Super Admin</h4>
              <p className="mb-0 text-white fs-12">superadmin@tanmeyaa.com</p>
            </div>
          </Overlay>
        </div>
        <div className="d-flex justify-content-start align-items-center ms-2 border-bottom">
          <div className="p-3">
            <FaUserAlt />
          </div>

          <p className="mb-0 ms-3 fs-6">My Profile</p>
        </div>
        <div className="d-flex justify-content-start align-items-center ms-2 border-bottom">
          <div className="p-3">
            <FaSignOutAlt />
          </div>
          <Link to={""} style={{ textDecoration: "none", color: "black" }}>
            <p className="mb-0 ms-3  fs-12">Log Out</p>
          </Link>
        </div>
      </div>
    </>
  );
};
export default AdminModal;
