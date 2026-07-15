import React, { useState } from "react";
import { Button } from "react-bootstrap";
import playIcon from "../../assets/images/playIcon.svg";
import blocks from "../../assets/images/blocks.svg";
import seamless from "../../assets/images/seamlessIcon.svg";
import borderline from "../../assets/images/borderline.svg";
import bottom from "../../assets/images/EllipseBottom.svg";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { Images } from "../Config/Images";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  const [Mbtn, setMbtn] = useState(false);
  const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };
  const cardData = [
    {
      title: t("teanenet.card.secure"),
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
      img: Images.Secure,
      link: t("teanenet.learnMore"),
    },
    {
      title: t("teanenet.card.autoUpdate"),
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
      img: Images.update,
      link: t("teanenet.learnMore"),
    },
    {
      title: t("teanenet.card.accountIsolation"),
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
      img: Images.update,
      link: t("teanenet.learnMore"),
    },
    {
      title: t("teanenet.card.autoUpdate"),
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
      img: Images.update,
      link: t("teanenet.learnMore"),
    },
    {
      title: t("teanenet.card.autoUpdate"),
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
      img: Images.update,
      link: t("teanenet.learnMore"),
    },
  ];
  const pricingCard = [
    {
      title: "Onboarding",
      time: "Monthly At",
      price: "$ 49.99",
      img: "",
      body: "Lorem ipsum dolor sit amet consectetur.",
      link: "Subscribe Now",
    },
    {
      title: "Onboarding",
      time: "Monthly At",
      price: "$ 49.99",
      img: "",
      body: "Lorem ipsum dolor sit amet consectetur.",
      link: "Subscribe Now",
    },
    {
      title: "Onboarding",
      time: "Monthly At",
      price: "$ 49.99",
      img: "",
      body: "Lorem ipsum dolor sit amet consectetur.",
      link: "Subscribe Now",
    },
    {
      title: "Onboarding",
      time: "Monthly At",
      price: "$ 49.99",
      img: "",
      body: "Lorem ipsum dolor sit amet consectetur.",
      link: "Subscribe Now",
    },
  ];
  const os = {
    name1: "Onboarding",
    name2: "Studio",
    Product: "Onboarding Studio",
    ProductDetails: "2235",
    BillingCycle: !Mbtn ? "Monthly" : "Yearly",
    PackagePrice: !Mbtn ? 49.99 : (49.9 * 12).toFixed(2),
    Taxes: 50,
    TotalPrice: "599.99",
  };
  const osStorage = JSON.stringify(os);
  localStorage.setItem("os", osStorage);
  const los = {
    name1: "Loan Origination",
    name2: "System with Onboarding Studio",
    Product: "Loan Origination System with Onboarding Studio",
    ProductDetails: "2235",
    BillingCycle: !Mbtn ? "Monthly" : "Yearly",
    PackagePrice: !Mbtn ? 299.99 : (299.9 * 12).toFixed(2),
    Taxes: 50,
    TotalPrice: "599.99",
  };

  const losStorage = JSON.stringify(los);
  localStorage.setItem("los", losStorage);

  const lms = {
    name1: "Loan Management",
    name2: "System",
    Product: "Loan Management System",
    ProductDetails: "2235",
    BillingCycle: !Mbtn ? "Monthly" : "Yearly",
    PackagePrice: !Mbtn ? 399.99 : (399.9 * 12).toFixed(2),
    Taxes: 50,
    TotalPrice: "699.99",
  };

  const lmsStorage = JSON.stringify(lms);
  localStorage.setItem("lms", lmsStorage);

  return (
    <>
      <div className="col-12 d-flex justify-content-center align-items-center img-fluid starting-img">
        <div className="d-flex justify-content-center text-center ">
          <div className="col-8 text-white">
            <h1 className="" style={{ fontSize: "64px", textAlign: "start" }}>
              {t("teanenet.hero.title")}
            </h1>
            <p style={{ fontSize: "24px" }}>
              {t("teanenet.hero.subtitle")}
            </p>
            <button
              style={{
                borderRadius: "32px",
                padding: "15px",
                marginTop: "3rem",
                background: " #1963b9",
                color: "white",
              }}
              onClick={() => {
                navigate("/teanenetflow/product");
              }}
            >
              {t("teanenet.hero.cta")}
              <span>
                <img className="ms-2" src={playIcon} alt="" />
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-center text-black mt-5">
        <div className="col-11 d-flex">
          <div className="col-6">
            <h1 style={{ fontSize: "32px" }}>
              {t("teanenet.empowering")}
            </h1>
            <p style={{ lineHeight: "1.5" }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
              vulputate libero et velit interdum, ac aliquet odio mattis.
            </p>
            <p style={{ lineHeight: "1.5" }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu
              turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus
              nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum
              tellus elit sed risus. Maecenas eget condimentum velit, sit amet
              feugiat lectus. Class aptent taciti sociosqu ad litora torquent
              per conubia nostra, per inceptos himenaeos. Praesent auctor purus
              luctus enim egestas, ac scelerisque ante pulvinar. Donec ut
              rhoncus ex.
            </p>
            <Button variant="danger">{t("teanenet.readMore")}</Button>
          </div>
          <div className="login-container">
            <div className="circle circle-one"></div>
            <div className="circle circle-two"></div>
            <div className="col-6 image-container">
              <img src={seamless} alt="" className="main-image" />
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-center text-black ">
        <div className="col-11 d-flex justify-content-center product-bg-curve mt-5">
          <div className="col-9 mt-5 mb-5">
            <h1
              className="d-flex justify-content-center"
              style={{ fontSize: "40px" }}
            >
              {t("teanenet.ourProducts")}
            </h1>
            <p style={{ fontSize: "19px", textAlign: "center" }}>
              {t("teanenet.productsDesc")}
            </p>
          </div>
        </div>
      </div>
      <div style={{ position: "relative" }}>
        <div className="d-flex text-black justify-content-center">
          <div className="col-11 d-flex product-bg p-3 gap-3">
            <div className="cards-container">
              <div className="card">
                <div className="col-8 d-flex mt-5">
                  <h1 style={{ fontSize: "40px" }}>Onboarding Studio</h1>
                </div>
                <p style={{ lineHeight: "1.5rem" }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
                  vulputate libero et velit interdum,
                </p>
                <ol style={{ lineHeight: "1.5rem" }}>
                  <li>Lorem ipsum dolor sit amet consectetur.</li>
                  <li>Lorem ipsum dolor sit amet consectetur.</li>
                  <li>Lorem ipsum dolor sit amet consectetur.</li>
                </ol>
                <div className="col-5 d-flex">
                  <Button className="demo-button">{t("teanenet.bookDemo")}</Button>
                </div>
              </div>
              <div className="card card-1">
                <div className="col-12 d-flex mt-5">
                  <h1>Loan Origination System</h1>
                </div>
                <p style={{ lineHeight: "1.5rem" }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
                  vulputate libero et velit interdum,
                </p>
                <ol style={{ lineHeight: "1.5rem" }}>
                  <li>Lorem ipsum dolor sit amet consectetur.</li>
                  <li>Lorem ipsum dolor sit amet consectetur.</li>
                  <li>Lorem ipsum dolor sit amet consectetur.</li>
                </ol>
                <div className="col-5 d-flex">
                  <Button className="demo-button">{t("teanenet.bookDemo")}</Button>
                </div>
              </div>
              <div className="card card-2">
                <div className="col-12 d-flex mt-5">
                  <h1>Loan Management System</h1>
                </div>
                <p style={{ lineHeight: "1.5rem" }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
                  vulputate libero et velit interdum,
                </p>
                <ol style={{ lineHeight: "1.5rem" }}>
                  <li>Lorem ipsum dolor sit amet consectetur.</li>
                  <li>Lorem ipsum dolor sit amet consectetur.</li>
                  <li>Lorem ipsum dolor sit amet consectetur.</li>
                </ol>
                <div className="col-5 d-flex">
                  <Button className="demo-button">{t("teanenet.bookDemo")}</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-center">
          {" "}
          <img
            className="col-11"
            style={{ position: "absolute", bottom: "130px" }}
            src={bottom}
            alt=""
          />
        </div>
      </div>{" "}
      <div className="d-flex justify-content-center">
        <div className="col-11 justify-content-start">
          <div className="col-12 d-flex">
            <img src={borderline} alt="" />

            <h1 className="ps-2">{t("teanenet.whyChooseUs")}</h1>
          </div>
          <div className="col-9 d-flex justify-content-center ps-5">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
            vulputate libero et velit interdum, ac aliquet odio mattis.
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-center mt-4">
        <div className="col-12 ps-5">
          <Carousel
            responsive={responsive}
            showDots={true}
            arrows={false}
            // Enables infinite scrolling
            autoPlay={true} // Automatically scrolls the items
            autoPlaySpeed={4000} // Speed of the autoplay in milliseconds
            swipeable={true} // Allows swiping on touch devices
          >
            {cardData.map((item, index) => {
              return (
                <div key={index} className="col-11">
                  <div className="card-pink">
                    <div className="col-12 d-flex ">
                      <div className="col-10">
                        <h1> {item.title}</h1>
                      </div>
                      <div className="col-2 d-flex justify-content-end">
                        <img src={item.img} alt="" />
                      </div>
                    </div>
                    <div
                      className="col-12 mt-2"
                      style={{ lineHeight: "1.5rem" }}
                    >
                      {item.body}
                    </div>
                    <div className="col-6">
                      <button
                        className="mt-4 p-3"
                        style={{
                          border: "2px solid #A40000",
                          borderRadius: "2px",
                          fontSize: "12px",
                          background: "transparent",
                          color: "#A40000",
                        }}
                      >
                        {item.link}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </Carousel>
        </div>
      </div>
      <div style={{ backgroundColor: "rgb(245, 245, 245)" }}>
        <div
          className="d-flex justify-content-center mt-5 "
          style={{ background: "#F5F5F5" }}
        >
          <div className="col-11 mt-5  d-flex justify-content-center">
            <div className="col-8  ">
              <h1 className="d-flex justify-content-center">
                {t("teanenet.pricingPlan")}
              </h1>
              <div style={{ lineHeight: "1.5rem", textAlign: "center" }}>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum,
                accusantium doloribus cum repellat asperiores quam nostrum,
                perspiciatis debitis error ex aliquam ea in animi commodi esse
                mollitia dicta, pariatur vero!
              </div>
              <div className="d-flex justify-content-center mt-3">
                <div
                  className="p-3"
                  style={{
                    background: Mbtn === false ? "red" : "white",
                    border: "1px solid #ccc",
                    color: Mbtn === false ? "white" : "black",
                    borderTopLeftRadius: "2px",
                    borderBottomLeftRadius: "2px",
                    clipPath: "polygon(0 0, 100% 0%, 100% 100%, 0% 100%)",
                  }}
                  onClick={() => setMbtn(false)}
                >
                  {t("teanenet.monthly")}
                </div>
                <div
                  className="p-3"
                  style={{
                    background: Mbtn === true ? "red" : "white",
                    color: Mbtn === true ? "white" : "black",
                    border: "1px solid #ccc",
                    borderTopRightRadius: "2px",
                    borderBottomRightRadius: "2px",
                    clipPath: "polygon(0 0, 100% 0%, 100% 100%, 0% 100%)",
                  }}
                  onClick={() => setMbtn(true)}
                >
                  {t("teanenet.yearly")}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="d-flex justify-content-center mt-5"
          style={{ background: "#F5F5F5" }}
        >
          <div className="col-11 mb-5 d-flex">
            <div className="col-md-4">
              <div className="plan-one">
                <div className="inner-block">
                  <div className="frame d-flex justify-content-center">
                    <div className="text-center">
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "rgba(255, 255, 255, 1)",
                        }}
                        className="mt-4"
                      >
                        {os.name1}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "rgba(255, 255, 255, 1)",
                        }}
                        className="mt-2"
                      >
                        {os.name2}
                      </div>

                      <div
                        style={{
                          fontSize: "9px",
                          fontWeight: "400",
                          color: "rgba(255, 255, 255, 1)",
                        }}
                        className="mt-3"
                      >
                        {os.BillingCycle} at
                      </div>
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: "500",
                          color: "rgba(255, 255, 255, 1)",
                        }}
                        className="mt-2"
                      >
                        {os.PackagePrice}
                      </div>
                    </div>
                  </div>
                  <div className="circle-bg d-flex justify-content-center mt-4">
                    <div className="image-wrap">
                      <img src={blocks} alt="" />
                    </div>
                  </div>
                  <div className="d-flex justify-content-center pt-3">
                    <div className="">
                      <div className="d-flex align-items-center">
                        <img src={Images.listIcon} height={6.5} width={6.5} />
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "400",
                            color: "rgba(0, 0, 0, 1)",
                          }}
                          className="ps-2"
                        >
                          Lorem ipsum dolor sit amet consectetur.
                        </div>
                      </div>
                      <div className="d-flex align-items-center mt-3">
                        <img src={Images.listIcon} height={6.5} width={6.5} />
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "400",
                            color: "rgba(0, 0, 0, 1)",
                          }}
                          className="ps-2"
                        >
                          Lorem ipsum dolor sit amet consectetur.
                        </div>
                      </div>
                      <div className="d-flex align-items-center mt-3">
                        <img src={Images.listIcon} height={6.5} width={6.5} />
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "400",
                            color: "rgba(0, 0, 0, 1)",
                          }}
                          className="ps-2"
                        >
                          Lorem ipsum dolor sit amet consectetur.
                        </div>
                      </div>
                      <div className="d-flex align-items-center mt-3">
                        <img src={Images.listIcon} height={6.5} width={6.5} />
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "400",
                            color: "rgba(0, 0, 0, 1)",
                          }}
                          className="ps-2"
                        >
                          Lorem ipsum dolor sit amet consectetur.
                        </div>
                      </div>
                      <div className="d-flex align-items-center mt-3">
                        <img src={Images.listIcon} height={6.5} width={6.5} />
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "400",
                            color: "rgba(0, 0, 0, 1)",
                          }}
                          className="ps-2"
                        >
                          Lorem ipsum dolor sit amet consectetur.
                        </div>
                      </div>
                      <div className="d-flex align-items-center mt-3">
                        <img src={Images.listIcon} height={6.5} width={6.5} />
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "400",
                            color: "rgba(0, 0, 0, 1)",
                          }}
                          className="ps-2"
                        >
                          Lorem ipsum dolor sit amet consectetur.
                        </div>
                      </div>
                      <div className="d-flex align-items-center mt-3">
                        <img src={Images.listIcon} height={6.5} width={6.5} />
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "400",
                            color: "rgba(0, 0, 0, 1)",
                          }}
                          className="ps-2"
                        >
                          Lorem ipsum dolor sit amet consectetur.
                        </div>
                      </div>
                      <div className="col-12 d-flex justify-content-center mt-4">
                        <div className="theme-btn-next mt-1 button-margin  d-flex justify-content-center cursor-pointer">
                          <li>
                            {" "}
                            <Link
                              to="/teanenetflow/product?value=1"
                              style={{ color: "white" }}
                            >
                              {" "}
                              {t("teanenet.subscribeNow")} {"->"}
                            </Link>
                          </li>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="plan-one">
                <div className="inner-block">
                  <div className="frame d-flex justify-content-center">
                    <div className="text-center">
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "rgba(255, 255, 255, 1)",
                        }}
                        className="mt-4"
                      >
                        {los.name1}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "rgba(255, 255, 255, 1)",
                        }}
                        className="mt-2"
                      >
                        {los.name2}
                      </div>
                      <div
                        style={{
                          fontSize: "9px",
                          fontWeight: "400",
                          color: "rgba(255, 255, 255, 1)",
                          textAlign: "center",
                        }}
                        className="mt-3"
                      >
                        {los.BillingCycle} at
                      </div>
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: "500",
                          color: "rgba(255, 255, 255, 1)",
                        }}
                        className="mt-2"
                      >
                        {los.PackagePrice}
                      </div>
                    </div>
                    <div className="tag-image">{t("teanenet.recommended")}</div>
                  </div>
                  <div className="circle-bg d-flex justify-content-center mt-4">
                    <div className="image-wrap">
                      <img src={blocks} alt="" />
                    </div>
                  </div>
                  <div className="d-flex justify-content-center pt-3">
                    <div className="">
                      <div className="d-flex align-items-center">
                        <img src={Images.listIcon} height={6.5} width={6.5} />
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "400",
                            color: "rgba(0, 0, 0, 1)",
                          }}
                          className="ps-2"
                        >
                          Lorem ipsum dolor sit amet consectetur.
                        </div>
                      </div>
                      <div className="d-flex align-items-center mt-3">
                        <img src={Images.listIcon} height={6.5} width={6.5} />
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "400",
                            color: "rgba(0, 0, 0, 1)",
                          }}
                          className="ps-2"
                        >
                          Lorem ipsum dolor sit amet consectetur.
                        </div>
                      </div>
                      <div className="d-flex align-items-center mt-3">
                        <img src={Images.listIcon} height={6.5} width={6.5} />
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "400",
                            color: "rgba(0, 0, 0, 1)",
                          }}
                          className="ps-2"
                        >
                          Lorem ipsum dolor sit amet consectetur.
                        </div>
                      </div>
                      <div className="d-flex align-items-center mt-3">
                        <img src={Images.listIcon} height={6.5} width={6.5} />
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "400",
                            color: "rgba(0, 0, 0, 1)",
                          }}
                          className="ps-2"
                        >
                          Lorem ipsum dolor sit amet consectetur.
                        </div>
                      </div>
                      <div className="d-flex align-items-center mt-3">
                        <img src={Images.listIcon} height={6.5} width={6.5} />
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "400",
                            color: "rgba(0, 0, 0, 1)",
                          }}
                          className="ps-2"
                        >
                          Lorem ipsum dolor sit amet consectetur.
                        </div>
                      </div>
                      <div className="d-flex align-items-center mt-3">
                        <img src={Images.listIcon} height={6.5} width={6.5} />
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "400",
                            color: "rgba(0, 0, 0, 1)",
                          }}
                          className="ps-2"
                        >
                          Lorem ipsum dolor sit amet consectetur.
                        </div>
                      </div>
                      <div className="d-flex align-items-center mt-3">
                        <img src={Images.listIcon} height={6.5} width={6.5} />
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "400",
                            color: "rgba(0, 0, 0, 1)",
                          }}
                          className="ps-2"
                        >
                          Lorem ipsum dolor sit amet consectetur.
                        </div>
                      </div>
                      <div className="col-12 d-flex justify-content-center mt-4">
                        <div className="theme-btn-next mt-1 button-margin  d-flex justify-content-center cursor-pointer">
                          <li>
                            {" "}
                            <Link
                              to="/teanenetflow/product?value=2"
                              style={{ color: "white" }}
                            >
                              {" "}
                              {t("teanenet.subscribeNow")} {"->"}
                            </Link>
                          </li>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="plan-one">
                <div className="inner-block">
                  <div className="frame d-flex justify-content-center">
                    <div className="text-center">
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "rgba(255, 255, 255, 1)",
                        }}
                        className="mt-4"
                      >
                        {lms.name1}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "rgba(255, 255, 255, 1)",
                        }}
                        className="mt-2"
                      >
                        {lms.name2}
                      </div>

                      <div
                        style={{
                          fontSize: "9px",
                          fontWeight: "400",
                          color: "rgba(255, 255, 255, 1)",
                        }}
                        className="mt-3"
                      >
                        {lms.BillingCycle} at
                      </div>
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: "500",
                          color: "rgba(255, 255, 255, 1)",
                        }}
                        className="mt-2"
                      >
                        {lms.PackagePrice}
                      </div>
                    </div>
                  </div>
                  <div className="circle-bg d-flex justify-content-center mt-4">
                    <div className="image-wrap">
                      <img src={blocks} alt="" />
                    </div>
                  </div>
                  <div className="d-flex justify-content-center pt-3">
                    <div className="">
                      <div className="d-flex align-items-center">
                        <img src={Images.listIcon} height={6.5} width={6.5} />
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "400",
                            color: "rgba(0, 0, 0, 1)",
                          }}
                          className="ps-2"
                        >
                          Lorem ipsum dolor sit amet consectetur.
                        </div>
                      </div>
                      <div className="d-flex align-items-center mt-3">
                        <img src={Images.listIcon} height={6.5} width={6.5} />
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "400",
                            color: "rgba(0, 0, 0, 1)",
                          }}
                          className="ps-2"
                        >
                          Lorem ipsum dolor sit amet consectetur.
                        </div>
                      </div>
                      <div className="d-flex align-items-center mt-3">
                        <img src={Images.listIcon} height={6.5} width={6.5} />
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "400",
                            color: "rgba(0, 0, 0, 1)",
                          }}
                          className="ps-2"
                        >
                          Lorem ipsum dolor sit amet consectetur.
                        </div>
                      </div>
                      <div className="d-flex align-items-center mt-3">
                        <img src={Images.listIcon} height={6.5} width={6.5} />
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "400",
                            color: "rgba(0, 0, 0, 1)",
                          }}
                          className="ps-2"
                        >
                          Lorem ipsum dolor sit amet consectetur.
                        </div>
                      </div>
                      <div className="d-flex align-items-center mt-3">
                        <img src={Images.listIcon} height={6.5} width={6.5} />
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "400",
                            color: "rgba(0, 0, 0, 1)",
                          }}
                          className="ps-2"
                        >
                          Lorem ipsum dolor sit amet consectetur.
                        </div>
                      </div>
                      <div className="d-flex align-items-center mt-3">
                        <img src={Images.listIcon} height={6.5} width={6.5} />
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "400",
                            color: "rgba(0, 0, 0, 1)",
                          }}
                          className="ps-2"
                        >
                          Lorem ipsum dolor sit amet consectetur.
                        </div>
                      </div>
                      <div className="d-flex align-items-center mt-3">
                        <img src={Images.listIcon} height={6.5} width={6.5} />
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "400",
                            color: "rgba(0, 0, 0, 1)",
                          }}
                          className="ps-2"
                        >
                          Lorem ipsum dolor sit amet consectetur.
                        </div>
                      </div>
                      <div className="col-12 d-flex justify-content-center mt-4">
                        <div className="theme-btn-next mt-1 button-margin  d-flex justify-content-center cursor-pointer">
                          <li>
                            {" "}
                            <Link
                              to="/teanenetflow/product?value=3"
                              style={{ color: "white", listStyle: "none" }}
                            >
                              {" "}
                              {t("teanenet.subscribeNow")} {"->"}
                            </Link>
                          </li>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{ background: "white" }}
        className="d-flex justify-content-center p-5"
      >
        <div className="col-10 d-flex justify-content-center">
          <div className="col-6">
            <h1 style={{ color: "red", fontSize: "32px" }}>
              {t("teanenet.newsletter.title")}
            </h1>
            <div>
              {t("teanenet.newsletter.subtitle")}
            </div>
          </div>
          <div className="col-6 d-flex justify-content-end align-items-center">
            <div className="d-flex align-items-center gap-2">
              <input
                type="email"
                placeholder={t("teanenet.newsletter.emailPlaceholder")}
                style={{
                  width: "370px",
                  padding: "7px",
                  borderRadius: "2px",
                }}
              />
              <Button
                style={{
                  background: "red",
                  border: "none",
                  borderRadius: "2px",
                }}
              >
                {t("teanenet.newsletter.subscribe")}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 d-flex justify-content-center footer-img">
        <div className="col-10 d-flex justify-content-center text-white align-items-center">
          <h1 className="text-center los-p">
            {t("teanenet.footer")}
          </h1>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
