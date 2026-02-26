import React from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts/core";
import { EChartsOption } from "echarts";

interface GraphsProps {
  option: EChartsOption;
}

const Graphs: React.FC<GraphsProps> = ({ option }) => {
  return (
    <ReactECharts
      echarts={echarts}
      option={option}
      style={{ height: "400px", width: "100%" }}
    />
  );
};

export default Graphs;
