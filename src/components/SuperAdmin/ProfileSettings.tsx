import React, { useState } from "react";
import { Input, DatePicker, Button } from "antd";
import { InputGroup, FormControl, Row, Col, Tab, Tabs } from "react-bootstrap";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
    const navigate = useNavigate();
    const validationSchema = Yup.object({
        fullName: Yup.string().required("Name is Required"),
        email: Yup.string().email("Invalid email").required("Email Adress is Required"),
        mobile: Yup.string().required("Mobile no. is Required"),
        dob: Yup.string().required("Date of Birth is Required"),
        address: Yup.string().required("Address Field is Required"),
    });

    return (
        <>
            <div className="max-w-7xl mx-auto py-4 px-4">
                <div
                    className="flex items-center space-x-2t ext-gray-900"
                    style={{ fontSize: "13px" }}
                >
                    <span>Dashboard</span>
                    <span> | </span>
                    <span>Tenants</span>
                    <span> | </span>
                    <span>Leads</span>
                </div>
            </div>
            <h1
                className="mx-auto py-3 px-4"
                style={{ fontWeight: "bold", fontSize: "17px" }}
            >
                Settings
            </h1>

            <div className="settings-wrapper">
                {/* Tabs positioned outside the container */}
                <Tabs
                    defaultActiveKey="general"
                    id="settings-tabs"
                    className="settings-tabs"
                >
                    <Tab title="General Information" eventKey="general">
                        <div className="settings-container">
                            <h2 className="settings-heading">General Settings</h2>

                            <Formik
                                initialValues={{
                                    fullName: "",
                                    email: "",
                                    mobile: "",
                                    dob: "",
                                    address: "",
                                }}
                                validationSchema={validationSchema}
                                onSubmit={(values) => {
                                }}
                            >
                                {({ setFieldValue, errors, touched }) => (
                                    <Form className="settings-form">
                                        <Row className="pt-3">
                                            <Col md={6}>
                                                <label>Name</label>
                                                <Field name="fullName" as={Input} placeholder="Full Name" />
                                                {errors.fullName && touched.fullName ? <div className="invalid-feedback text-danger">{errors.fullName}</div> : null}
                                            </Col>

                                            <Col md={6}>
                                                <label>Email</label>
                                                <Field name="email" as={Input} placeholder="username@email.com" />
                                                {errors.email && touched.email ? <div className="invalid-feedback text-danger">{errors.email}</div> : null}
                                            </Col>
                                        </Row>
                                        <Row className="pt-3">
                                            <Col md={6}>
                                                <label>Mobile No.</label>
                                                <Field name="mobile" as={Input} placeholder="+966 5123144521" />
                                                {errors.mobile && touched.mobile ? <div className="invalid-feedback text-danger">{errors.mobile}</div> : null}
                                            </Col>

                                            <Col md={6}>
                                                <label>Date of Birth</label>
                                                <DatePicker
                                                    onChange={(date, dateString) => setFieldValue("dob", dateString)}
                                                    placeholder="Select Date"
                                                    style={{ width: "100%" }}
                                                />
                                                {errors.dob && touched.dob ? <div className="invalid-feedback text-danger">{errors.dob}</div> : null}
                                            </Col>
                                        </Row>
                                        <Row className="pt-3">
                                            <Col md={6}>
                                                <label>Address</label>
                                                <Field name="address" as={Input.TextArea} placeholder="Address" />
                                                {errors.address && touched.address ? <div className="invalid-feedback text-danger">{errors.address}</div> : null}
                                            </Col>
                                        </Row>

                                        <div className="d-flex justify-content-end py-2">
                                            <Button className="revert-btn" style={{ marginRight: "5px" }} onClick={() => navigate(-1)}>Back</Button>
                                            <Button type="primary" htmlType="submit" className="application-btn">Save</Button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </Tab>

                    <Tab eventKey="password" title="Password Settings">
                        <div className="settings-container">
                            <h2 className="settings-heading">Password Settings</h2>

                            <Formik
                                initialValues={{
                                    newPassword: "",
                                    confirmPassword: "",
                                }}
                                validationSchema={Yup.object({
                                    newPassword: Yup.string().min(6, "Too Short!").required("Please Enter the New Password"),
                                    confirmPassword: Yup.string()
                                        .oneOf([Yup.ref("newPassword")], "Passwords must match")
                                        .required("Required"),
                                })}
                                onSubmit={(values) => {
                                }}
                            >
                                {({ errors, touched }) => (
                                    <Form className="settings-form">
                                        <Row className="pt-3">
                                            <Col md={6}>
                                                <label>New Password</label>
                                                <Field name="newPassword" as={Input.Password} placeholder="Enter new password" />
                                                {errors.newPassword && touched.newPassword ? (
                                                    <div className="invalid-feedback text-danger">{errors.newPassword}</div>
                                                ) : null}
                                            </Col>

                                            <Col md={6}>
                                                <label>Confirm Password</label>
                                                <Field name="confirmPassword" as={Input.Password} placeholder="Confirm password" />
                                                {errors.confirmPassword && touched.confirmPassword ? (
                                                    <div className="invalid-feedback text-danger">{errors.confirmPassword}</div>
                                                ) : null}
                                            </Col>
                                        </Row>

                                        <div className="d-flex justify-content-end py-2">
                                            <Button className="revert-btn" style={{ marginRight: "5px" }} onClick={() => navigate(-1)}>Back</Button>
                                            <Button type="primary" htmlType="submit" className="application-btn">Save</Button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </Tab>
                </Tabs>
            </div>
        </>
    );
};

export default SettingsPage;
