import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { Images } from "../Config/Images";
import { getProductsListing } from "../../redux/apis/apisCrudFactoring";
import { setProdId } from "../../redux/apis/apisSlice";

const whyChoosePoints = [
  "Fast funding decisions with transparent fees.",
  "Shariah-compliant structuring across industries.",
  "Dedicated support for SME and enterprise clients.",
];

const ManagementForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProductsListing();
        if (res?.data?.success && Array.isArray(res.data.data)) {
          setProducts(res.data.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        // For now just log; UI will show no products
        console.error("Failed to load products listing", error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  const handleApply = (product: any) => {
    dispatch(
      setProdId({
        prodId: product.id
      })
    );
    navigate("/applyloan/partner");
  };

  const heroBackground =
    "https://devlos.factoringvalley.com.sa/storage/setting/1/image/4PmQ7ZtfXC-1762436319.jpeg";
  const quickBackground =
    "https://devlos.factoringvalley.com.sa/storage/setting/1/image/nwfhNz0H5N-1761906002.jpeg";
  const heroHeadingStyle = {
    fontSize: "3.8rem",
    fontWeight: 700,
    lineHeight: 1.15,
  };
  const heroLeadStyle = {
    fontSize: "1.4rem",
  };
  const cardTextStyle = {
    color: "black",
  };
  const overlayStyle = {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "2px",
    color: "black",
  };

  return (
    <div className="management-landing-page" style={{ lineHeight: "24px" }}>
      <section
        className="bg-image-dynamic"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${heroBackground})`,filter: "brightness(1.5)",
        }}
      >
        <div className="bg-light">
          <div className="container">
              <div className="d-flex align-items-center justify-content-between py-1 flex-column flex-md-row">
                <img
                  src={Images.DashboardLogo}
                  alt="Factoring Valley Logo"
                  style={{height: 48, objectFit: "contain"}}
                 
                />
              <div className="d-flex align-items-center flex-column flex-md-row contact-info">
                <h3 className="mb-0 d-flex align-items-center">
                  <a className="phone-link d-flex align-items-center" href="tel:9200XXXXXX">
                  <img
                
                    src="https://devlos.factoringvalley.com.sa/landingPage/images/call.png"
                    className="me-1"
                    alt="phone icon"
                  />
                  <div>
                  9200XXXXXX
                  </div>
                 
                  </a>
                </h3>
              </div>
            </div>
          </div>
        </div>
        <div className="container text-white d-flex align-items-center justify-content-center" style={{margin: "50px 50px",minHeight: "70vh",filter: "brightness(1.5)"}}>
          <div className="text-container col-md-7">
            <h1 className="banner-heading" style={heroHeadingStyle}>
              A simple way to factor your business
            </h1>
            <p className="lead-text mb-4" style={heroLeadStyle}>
              Apply now.
            </p>
          </div>
        </div>
      </section>

      <section className="">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <p className="heading py-4">Our Products</p>
            </div>

            {products.length === 0 && (
              <div className="col-12 mb-4">
                <div className="container" style={{ lineHeight: "1.5" }}>
                  <div style={overlayStyle}>
                    <div className="text-center pb-2">
                      <p className="m-0 txt-bold" style={cardTextStyle}>
                        No products available at the moment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {products.map((product) => (
              <div key={product.id} className="col-md-6 mb-4">
                <div className="container" style={{ lineHeight: "1.5" }}>
                  <div style={overlayStyle}>
                    <div className="text-center pb-2">
                      <p className="m-0 txt-bold" style={cardTextStyle}>
                        {product.name_en}
                      </p>
                    </div>
                    <div className="row gy-3">
                      <div className="col-lg-12 col-md-12">
                        <div className="padder-xy pb-0 px-0">
                          <div
                            className="btn-group"
                            role="group"
                            aria-label="Apply for product"
                          >
                            <button
                              type="button"
                              className="btn btn-theme float-end mx-1"
                              onClick={() => handleApply(product)}
                            >
                              Apply for {product.name_en}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="padder choose">
    <div className="container text-center">
        <h1 className="heading justify-content-center">Why Choose Merchant Cash Advance</h1>
        <div className="row py-5 why-choose">
                <div className="col-md text-center">
                    <img className="d-block mx-auto mb-3" height="100" src="https://devlos.factoringvalley.com.sa/landingPage/images/icon-1.png" alt="Fast Funding Decisions"/>
                    <h5>Fast Funding Decisions</h5>
                    <p>Invoice Factoring Decision with in 24 hours</p>
                </div>
                <div className="col-md text-center">
                    <img className="d-block mx-auto mb-3" height="100" src="https://devlos.factoringvalley.com.sa/landingPage/images/icon-2.png" alt="No Origination Fee"/>
                    <h5>No Orignation Fee</h5>
                    <p>Shariah complaint with no hidden charges</p>
                </div>
                <div className="col-md text-center">
                    <img className="d-block mx-auto mb-3" height="100" src="https://devlos.factoringvalley.com.sa/landingPage/images/icon-3.png" alt="We Serve Most Industries"/>
                    <h5>We Serve Most Industries</h5>
                    <p>We are the pioneer in shariah complaint factoring</p>
                </div>
        </div>
    </div>
</section>
<section className="padder">
        <div className="container text-center">
          <h1 className="heading justify-content-center">About Us</h1>
          <div className="row justify-content-center mt-4">
            <div className="col-10">
              <p><strong>Our Vision</strong></p>
              <p>"To be the leading provider of innovative and reliable factoring solutions in Saudi Arabia, empowering businesses to achieve financial stability and growth."</p>
              
              <p><strong>Our Mission</strong></p>
              <p>"Our mission is to offer customized factoring services that enhance liquidity, support sustainable business growth, and contribute to the economic development of Saudi Arabia. We are committed to delivering exceptional customer service, leveraging advanced technology, and adhering to the highest standards of integrity and professionalism."</p>
              
              <p><strong>Our Objectives</strong></p>
              
              <p><strong>1. Financial Empowerment:</strong></p>
              <p>- Facilitate easy and quick access to working capital for small and medium-sized enterprises (SMEs) to improve their cash flow and business operations.</p>
              <p>- Provide competitive and transparent factoring rates to ensure affordability and value for clients.</p>
              
              <p><strong>2. Customer-Centric Services:</strong></p>
              <p>- Offer tailored factoring solutions to meet the unique needs of different industries within the Saudi market.</p>
              <p>- Maintain high levels of customer satisfaction through responsive and personalized service.</p>
              
              <p><strong>3. Market Leadership:</strong></p>
              <p>- Achieve a significant market share in the Saudi factoring industry within the next five years.</p>
              <p>- Establish strong partnerships with banks and financial institutions to expand service offerings and reach.</p>
              
              <p><strong>4. Innovation and Technology:</strong></p>
              <p>- Invest in state-of-the-art technology to streamline factoring processes, ensuring efficiency and security.</p>
              <p>- Continuously innovate and adapt to market changes by integrating digital solutions that enhance the customer experience.</p>
              
              <p><strong>5. Compliance and Risk Management:</strong></p>
              <p>- Adhere to all regulatory requirements and best practices to ensure legal and ethical business operations.</p>
              <p>- Implement robust risk management strategies to protect the interests of both the firm and its clients.</p>
              
              <p><strong>6. Economic Contribution:</strong></p>
              <p>- Support the economic diversification goals of Saudi Vision 2030 by enabling businesses to thrive and grow.</p>
              <p>- Contribute to job creation and economic stability by providing financial solutions that promote business sustainability.</p>
              
              <p><strong>7. Community Engagement:</strong></p>
              <p>- Engage in corporate social responsibility (CSR) initiatives that benefit the local community and foster economic development.</p>
              <p>- Promote financial literacy and education among SMEs to help them make informed financial decisions.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="padder">
        <div className="container">
          <div className="row no-gutters">

            <div className="col-md-6 my-auto pr-md-5 order-md-3">
              <h2 
                className="sub-heading" 
                style={{
                  color: "#1963b9",
                  fontSize: "2.4rem",
                  fontFamily: '"Lato-bold", sans-serif',
                  fontWeight: 700,
                  textAlign: "left"
                }}
              >
                Quick Factoring
              </h2>
              <div>
                <p>Quick Factoring is the fastest factoring facility, It is a quick fix for your business problems. This facility can be availed within 24 hours and can be utilised for 30 days. Below are the salient features for Quick Factoring product</p>
                <p>
                  Shariah Compliance<br />
                  Amount: Upto SR 150,000<br />
                  Duration: One month factoring<br />
                  Approval within 24 hours
                </p>
              </div>
              <a href="#" className="btn btn-lg btn-theme mb-2" style={{maxWidth: "fit-content"}}>Apply Now</a>
            </div>
          </div>
        </div>
      </section>
      <section className="padder">
        <div className="container text-center">
          <h1 className="heading">Why Choose Us?</h1>
          <div className="row justify-content-center mt-4">
            <div className="col-10">
              <p>
                Within our values and the Islamic Shari’a spirit and principles, we are a Saudi
                national company supporting SMEs and promoting factoring services in compliance
                with Shari'ah principles and Central Bank regulations. We provide a variety of
                solutions tailored to our corporate clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="bg-img-set-dymanic text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('${quickBackground}')`,
        }}
      >
      
      </section>
      <div className="d-flex mt-2 justify-content-center flex-column flex-md-row">
                <a href="#" className="btn btn-lg mt-3 btn-theme" style={{maxWidth: "fit-content"}}>
                  Apply for Quick Factoring
                </a>
              </div>
      <footer className="p-4 text-center">
        <p>
          Copyright Factoring Valley Co.
          <br />
          Powered by MYTM LLC KSA.
        </p>
      </footer>
    </div>
  );
};

export default ManagementForm;

