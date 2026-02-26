import React, { useState } from 'react';
import profile from "../../assets/images/profilepic.png";
import clickIcon from "../../assets/images/clickIcon.png";



const DashboardProfile: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const storedUserData = localStorage.getItem("userData");
  const user = storedUserData ? JSON.parse(storedUserData) : null;
  const [formData, setFormData] = useState({
    name: user?.user?.name,
    email: user?.user?.email,
    phone: user?.user?.phone,
    password: '',
    passwordConfirmation: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirmation) {
      alert('Passwords do not match');
      return;
    }
    // Handle form submission (e.g., API call)
    setIsModalOpen(false);
  };

  return (
    <div>
      {/* Profile Section */}
      <div className="page-title">
        <h3 style={{paddingLeft: "0px" , paddingBottom: "20px"}}>My Profile</h3>
      </div>
      <div className="profile-image">
        <img src={profile} alt="Profile" />
      </div>
      <div className="row mt-5">
        <div className="col-md-6">
            <div className='list-detail'>
                <div className="detail-dev">
                    <span>Full Name</span>
                    <span className="name">{formData.name}</span>
                </div>
                <a><img src={clickIcon} alt='icon'></img></a>
            </div>
            <div className='list-detail'>
          <div className="detail-dev">
            <span>Email Address</span>
            <span className="name">{formData.email}</span>
          </div>
          <a><img src={clickIcon} alt='icon'></img></a>
          </div>
          <div className='list-detail'>
          <div className="detail-dev">
            <span>Phone No.</span>
            <span className="name">{formData.phone || 'Not provided'}</span>
          </div>
          <a><img src={clickIcon} alt='icon'></img></a>
          </div>
          <div className='list-detail'>

          <div className="detail-dev">
            <span>Current Password</span>
            <span className="name">********</span>
          </div>
          <a><img src={clickIcon} alt='icon'></img></a>
          </div>
          <div className="w-100 text-end mt-3">
            <button
              type="button"
              className="dt-button btn btn-dark text-light"
              onClick={() => setIsModalOpen(true)}
            >
              Update
            </button>
          </div>
        </div>
        <div className="col-md-1">

        </div>
      </div>

      {/* Update Profile Modal */}
      <div
        className={`modal fade ${isModalOpen ? 'show' : ''}`}
        style={{ display: isModalOpen ? 'block' : 'none' }}
        id="update-profile"
        tabIndex={-1}
        aria-labelledby="staticBackdropAddLabel"
        aria-hidden={!isModalOpen}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title text-dark" id="staticBackdropAddLabel">
                Update Profile
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              ></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <input type="hidden" id="userId" name="userId" value="1" />
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <div className="form-floating">
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="name">Full Name</label>
                    </div>
                  </div>
                  <div className="col-md-6 mb-2">
                    <div className="form-floating">
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="email">Email Address</label>
                    </div>
                  </div>
                  <div className="col-md-12 mb-2">
                    <div className="form-floating">
                      <input
                        type="text"
                        className="form-control"
                        name="phone"
                        placeholder="Phone No."
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                      <label htmlFor="phone">Phone No.</label>
                    </div>
                  </div>
                  <div className="col-md-6 mb-2">
                    <div className="form-floating">
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                      <label htmlFor="password">Password</label>
                    </div>
                  </div>
                  <div className="col-md-6 mb-2">
                    <div className="form-floating">
                      <input
                        type="password"
                        className="form-control"
                        name="passwordConfirmation"
                        placeholder="Confirm Password"
                        value={formData.passwordConfirmation}
                        onChange={handleInputChange}
                        required
                      />
                      <label htmlFor="passwordConfirmation">Confirm Password</label>
                      {formData.password !== formData.passwordConfirmation && (
                        <span style={{ color: 'red' }}>Password not match</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary my-3 button-style"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
                <button type="submit" className="btn btn-dark my-3">
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {isModalOpen && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default DashboardProfile;