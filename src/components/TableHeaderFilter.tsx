import { useEffect, useState, useRef } from "react";

import type { MenuProps } from "antd";
import { Menu, Input, Checkbox } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../redux/rootReducer";
import { FaFilter } from "react-icons/fa";


const TableHeaderFilter = ({
  button,
  searchPlaceHolder,
  setSearchValue,
  searchValue,
  searchInput,
}: any) => {
  const themeBuilder = useSelector((state: RootState) => state.block.theme);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileStructure, setMobileStructure] = useState(false);
  const [formatDrop, setFormatDrop] = useState(false);
  const [filterDrop, setFilterDrop] = useState(false);
  const [checkedItems, setCheckedItems] = useState<any>({
    Freeze: false,
    Descriptions: false,
    "Start Date": false,
    "End Date": false,
    Direct: false,
    Enabled: false,
    "Collateral Type": false,
    "Collateral Sub Ty..": false,
    "Collateral Sub Ty..2": false,
  });

  const [current, setCurrent] = useState("1");
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const onClick: MenuProps["onClick"] = (e) => {
    setCurrent(e.key);
  };
  const handleFormat = () => {
    setFormatDrop(!formatDrop);
  };
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);

      if (window.innerWidth < 768) {
        setMobileStructure(true);
      } else {
        setMobileStructure(false);
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (event: any) => {
    setSearchValue(event.target.value);
  };

  const handleCheckboxChange = (item: string) => {
    setCheckedItems({
      ...checkedItems,
      [item]: !checkedItems[item],
    });
  };

  const menuItems = [
    {
      key: "sub1",

      label: "columns",
      children: Object.keys(checkedItems).map((item) => ({
        key: item,
        label: (
          <Checkbox
            checked={checkedItems[item]}
            onChange={() => handleCheckboxChange(item)}
          >
            {item}
          </Checkbox>
        ),
      })),
    },
    { key: "5", label: "Freeze" },
    { key: "6", label: "Detach" },
    { key: "7", label: "Sort" },
    { key: "8", label: "Reorder Column" },
    { key: "9", label: "Query by Example" },
  ];

  return (
    <div className="pt-3 pb-3">
      {isMobile && (
        <div>
          <button
            className="structure-btn mt-4"
            onClick={() => {
              setMobileStructure(!mobileStructure);
            }}
          >
            {<FaFilter />}
          </button>
        </div>
      )}
    </div>
  );
};

export default TableHeaderFilter;
