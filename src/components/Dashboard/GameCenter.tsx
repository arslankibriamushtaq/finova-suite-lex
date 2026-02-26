import { Col, Card } from "antd";
import LineChart from "../Dashboard/LineChart";
import PieChart from "../Dashboard/PieChart";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Images } from "../Config/Images";
import { themeStyle } from "../Config/Theme";
import ReactECharts from "echarts-for-react";
import icon from "../../assets/images/Vector-11.png";
import circle from "../../assets/images/circle-icon.png";
import DashboardGameCenter from "../DashboardHeader/DashboardGameCenter";
import DashboardJaveline from "../DashboardHeader/DashboardJaveline";
import DashboardSpinWheel from "../DashboardHeader/DashboardSpinWheel";
import { gamecenterLists } from "../../redux/apis/apisCrud";
import AllRewards from "./AllRewards";

const GameCenter = () => {

   
  return (
    <div className="dashboard">
      <DashboardGameCenter />
      <DashboardJaveline />
      <DashboardSpinWheel />
    </div>
  );
};

export default GameCenter;
