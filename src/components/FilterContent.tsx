import { Input, DatePicker } from "antd";
import { EditOutlined, CalendarOutlined } from "@ant-design/icons";

const FilterContent = () => {
  return (
    <div className="filter-content">
      <div className="input-item">
        <EditOutlined style={{ fontSize: "16px", color: "#595959" }} />
      </div>
      <div className="input-item">
        <Input placeholder="12345678" bordered={false} />
      </div>
      <div className="input-item">
        <Input placeholder="abcdef" bordered={false} />
      </div>
      <div className="input-item">
        <DatePicker
          placeholder="Select date"
          suffixIcon={<CalendarOutlined />}
          bordered={false}
          style={{ width: "100%" }}
        />
      </div>
      <div className="input-item">
        <DatePicker
          placeholder="Select date"
          suffixIcon={<CalendarOutlined />}
          bordered={false}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
};

export default FilterContent;
