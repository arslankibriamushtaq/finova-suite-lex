import React, { useEffect, useRef, useState } from "react";
import { Badge, Button, Col, Row } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";
import * as Babel from "@babel/standalone";
import toast from "react-hot-toast";

const availableParameters = [
  "BalloonAmount",
  "MonthlyPayment",
  "Tenure",
  "AdminFee",
  "FinanceChargerate",
  "Terms",
];
const eligibilityFormulas = [
  "Age and Salary Calculator",
  "Total Fees",
  "Total Cost of Credit",
  "Combined Risk Score",
  "Profit Calculation (Total Profit)",
  "Early Settlement Amount",
];
const financeFormulas = [
  "Total Fees",
  "Total Cost of Credit",
  "Combined Risk Score",
  "Profit Calculation (Total Profit)",
  "Early Settlement Amount",
];
const customFormulas = [
  "Total Payable (Version 1.0)",
  "Total Payable (Version 1.1)",
];
const parameterValues = {
  "Balloon Amount": 10000,
  "Monthly Payment": 500,
  Tenure: 12,
  "Admin Fee": 200,
  "Finance Charge rate": 0.05,
  Terms: 24,
};

function LoanCalculatorCustomFormula({
  setFormulaExpression,
  formulaExpression,
}: any) {
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
  const [formula, setFormula] = useState<string>("");
  const [customFormulas, setCustomFormulas] = useState([]);
  const handleFormula = (value: string) => {
    setFormula(value);
  };
  useEffect(() => {}, [formula]);

  const toggleParameter = (param: string) => {
    setSelectedParameters((prev) => {
      if (prev.includes(param)) {
        // If the parameter is already selected, remove it
        setFormulaExpression((exp) =>
          exp
            .split(" ")
            .filter((p) => p !== param)
            .join(" ")
        );
        return prev.filter((p) => p !== param);
      } else {
        // If the parameter is not selected, add it
        setFormulaExpression((exp) => (exp ? exp + " " + param : param));
        return [...prev, param];
      }
    });
  };

  // Handle Calculator Button Clicks (Append Operations & Numbers)
  const handleCalculatorClick = (value: string) => {
    setFormulaExpression((prev) => prev + " " + value + " ");
  };
  // Handle Clearing Formula
  const clearFormula = () => {
    setFormulaExpression("");
    setFormula("");
    setSelectedParameters([]);
  };
  
  const clearLastEntry = () => {
    setFormulaExpression((prev) => {
      // Split the expression into tokens (space-separated)
      const tokens = prev.trim().split(/\s+/);

      // If there's nothing to remove, return an empty string
      if (tokens.length === 0) return "";

      // Remove the last entry
      tokens.pop();

      // Rejoin the remaining tokens and return
      return tokens.join(" ");
    });
  };

  const validateExpression = (expression) => {
    // Trim extra spaces
    const trimmedExpr = expression.trim();

    // Ensure expression does not start or end with an operator
    if (/^[+\-*/]/.test(trimmedExpr)) {
      return "Error: Expression cannot start with an operator";
    }
    if (/[+\-*/]$/.test(trimmedExpr)) {
      return "Error: Expression cannot end with an operator";
    }

    // Ensure no consecutive operators (e.g., ++, **, //, etc.)
    if (/[\+\-\*\/]{2,}/.test(trimmedExpr)) {
      return "Error: Invalid consecutive operators";
    }

    // Ensure balanced parentheses
    let stack = [];
    for (let char of trimmedExpr) {
      if (char === "(") stack.push(char);
      if (char === ")") {
        if (stack.length === 0) return "Error: Unmatched parentheses";
        stack.pop();
      }
    }
    if (stack.length !== 0) return "Error: Unmatched parentheses";

    // Prevent division by zero
    if (/\/\s*0(?!\.\d)/.test(trimmedExpr)) {
      return "Error: Division by zero is not allowed";
    }

    // Ensure parameters are not consecutive without an operator
    if (/\b[a-zA-Z_]+\s+[a-zA-Z_]+\b/.test(trimmedExpr)) {
      return "Error: Parameters must be separated by an operator";
    }

    return ""; // No errors, valid expression
  };

  const handleSaveFormula = () => {
    const error = validateExpression(formulaExpression);
    if (error) {
      toast.error(`Cannot save formula: ${error}`);
      return;
    }

    if (!formula.trim()) {
      toast.error("Formula name cannot be empty!");
      return;
    }

    const newFormula = {
      name: formula.trim(),
      expression: formulaExpression.trim(),
    };

    // Get existing formulas from local storage
    const storedFormulas =
      JSON.parse(localStorage.getItem("customFormulas")) || [];

    // Check if the formula already exists
    const isDuplicate = storedFormulas.some((f) => f.name === newFormula.name);
    if (isDuplicate) {
      toast.error("A formula with this name already exists!");
      return;
    }

    // Save updated formulas list
    const updatedFormulas = [...storedFormulas, newFormula];
    localStorage.setItem("customFormulas", JSON.stringify(updatedFormulas));

    // Update the UI to show the new formula
    setCustomFormulas(updatedFormulas);

    toast.success("Formula saved successfully!");
  };

  useEffect(() => {
    const storedFormulas =
      JSON.parse(localStorage.getItem("customFormulas")) || [];
    setCustomFormulas(storedFormulas);
  }, []);
useEffect(() => {

}, [formulaExpression]);

  return (
    <>
      <div className="flex p-4 border shadow-sm">
        <div className="d-flex justify-content-between align-items-center  mb-4">
          <h4 className="fs-20 fw-600"> Make Custom Formula</h4>
        </div>
        <div>
          <div className="d-flex px-4">
            <div className="selected-parameters">
              {availableParameters.map((param, index) => (
                <span
                  key={index}
                  className={`parameter-badge ${
                    selectedParameters.includes(param) ? "selected" : ""
                  }`}
                  onClick={() => toggleParameter(param)}
                >
                  {param}{" "}
                  {selectedParameters.includes(param) && (
                    <FaTimes className="close-icon" />
                  )}
                </span>
              ))}
            </div>
          </div>
          <div className="divider"></div>
          <div className="d-flex mb-4 justify-content-center">
            <div
              className="col-md-5 formula-section border p-4 me-3"
              style={{ borderRadius: "6px" }}
            >
              {/* Formula Input Section */}

              <div className="col-12 d-flex">
                <h5
                  className="col-6"
                  style={{ fontWeight: "bold", fontSize: 16 }}
                >
                  Your Formula
                </h5>
                <div className="col-6 d-flex justify-content-end">
                  <button
                    className="clear-btn "
                    style={{ fontSize: 12 }}
                    onClick={clearFormula}
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <label
                  className="mb-1"
                  style={{ fontSize: "14px", fontWeight: "normal" }}
                >
                  Formula Name
                </label>
                <input
                  type="text"
                  value={formula}
                  onChange={(e: any) => {
                    handleFormula(e.target.value);
                  }}
                  className="form-control"
                  placeholder="Monthly Payment Calculation (Without Balloon Payment)"
                />
                <div className="formula-expression-box">
                  <p>
                    {formula
                      ? `${formula} ${"="} ${formulaExpression}`
                      : formulaExpression || ""}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="col-md-4 calculator-section border p-4 me-3"
              style={{ borderRadius: "6px" }}
            >
              {/* Calculator Section */}

              <div className="calculator-grid ">
                {[
                  "7",
                  "8",
                  "9",
                  "/",
                  "(",
                  "4",
                  "5",
                  "6",
                  "*",
                  ")",
                  "1",
                  "2",
                  "3",
                  "-",
                  "=",
                  "0",
                  "00",
                  ".",
                  "+",
                  "DEL",
                ].map((btn, index) => (
                  <button
                    key={index}
                    className="calc-btn py-3 px-4"
                    onClick={() =>
                      btn === "DEL"
                        ? clearLastEntry()
                        : handleCalculatorClick(btn)
                    }
                  >
                    {btn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex p-2">
          <div className="d-flex col-md-12 mt-3 mb-5">
            <Col md={4} className="formula-box me-2 p-4">
              <h4 className="fs-20 fw-600 mb-3">Eligibility Formulas</h4>
              <div className="d-flex flex-wrap gap-2">
                {eligibilityFormulas.map((param, index) => (
                  <Badge
                    key={index}
                    className="custom-badge fs-12 fw-normal rounded-pill"
                  >
                    {param}
                  </Badge>
                ))}
              </div>
            </Col>
            <Col md={4} className="formula-box me-2 p-4">
              <h4 className="fs-20 fw-600 mb-3">Finance Formulas</h4>
              <div className="d-flex flex-wrap gap-2">
                {financeFormulas.map((param, index) => (
                  <Badge
                    key={index}
                    className="custom-badge fs-12 fw-normal rounded-pill"
                  >
                    {param}
                  </Badge>
                ))}
              </div>
            </Col>
            <Col md={4} className="formula-box me-2 p-4">
              <h4 className="fs-20 fw-600 mb-3">Custom Formula</h4>
              <div className="d-flex flex-wrap gap-2">
                {customFormulas.map((formula, index) => (
                  <Badge
                    key={index}
                    className="custom-badge fs-12 fw-normal rounded-pill"
                  >
                    {formula.name}
                  </Badge>
                ))}
              </div>
            </Col>
          </div>
        </div>
        <MiniCompiler></MiniCompiler>
        <div className="d-flex justify-content-center">
          <Button
            variant="danger"
            className="save-formula-btn"
            onClick={handleSaveFormula}
          >
            Save Formula
          </Button>
        </div>
      </div>
    </>
  );
}

export default LoanCalculatorCustomFormula;

export const MiniCompiler = () => {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const textareaRef = useRef(null);
  const containerRef = useRef(null);

  const handleCodeChange = (e) => {
    const value = e.target.value;
    setCode(value);

    // Get last typed word
    const words = value.split(/[\s()+\-*/]/);
    const lastWord = words[words.length - 1];

    const storedFormulas =
      JSON.parse(localStorage.getItem("customFormulas")) || [];

    // Filter suggestions
    if (lastWord.length > 0) {
      // Extract formula names from stored formulas
      const formulaNames = storedFormulas.map((entry) => entry.name);

      // Filter matches for both parameters and formulas
      const paramMatches = availableParameters.filter((param) =>
        param.toLowerCase().startsWith(lastWord.toLowerCase())
      );

      const formulaMatches = formulaNames.filter((name) =>
        name.toLowerCase().startsWith(lastWord.toLowerCase())
      );

      setSuggestions([...paramMatches, ...formulaMatches]);
      setSelectedIndex(paramMatches.length > 0 ? 0 : -1);
    } else {
      setSuggestions([]);
    }

    setTimeout(() => {
      if (!textareaRef.current || !containerRef.current) return;

      const textarea = textareaRef.current;
      const { selectionStart } = textarea;

      // Get the cursor position directly from the textarea
      // This is more accurate than trying to calculate it ourselves
      const cursorCoords = getCursorCoordinates(textarea, selectionStart);
      
      // Apply position relative to the textarea
      setCursorPosition({
        top: cursorCoords.top + 20, // Add a small offset to position below the line
        left: cursorCoords.left
      });
    }, 0);
  };

  // Function to get precise cursor coordinates
  const getCursorCoordinates = (textarea, position) => {
    // Store the original text and scroll positions
    const text = textarea.value;
    const originalScrollTop = textarea.scrollTop;
    const originalScrollLeft = textarea.scrollLeft;
    
    // Create a mirror div to copy the textarea's style
    const mirror = document.createElement('div');
    const computedStyle = window.getComputedStyle(textarea);
    
    // Copy styles from textarea to mirror
    const stylesToCopy = [
      'fontFamily', 'fontSize', 'fontWeight', 'lineHeight',
      'letterSpacing', 'textTransform', 'wordSpacing', 'textIndent',
      'boxSizing', 'borderRightWidth', 'borderLeftWidth',
      'borderTopWidth', 'borderBottomWidth', 'paddingRight',
      'paddingLeft', 'paddingTop', 'paddingBottom',
      'whiteSpace', 'wordWrap', 'wordBreak', 'overflowWrap'
    ];
    
    stylesToCopy.forEach(style => {
      mirror.style[style] = computedStyle[style];
    });
    
    // Set mirror's display properties
    mirror.style.position = 'absolute';
    mirror.style.visibility = 'hidden';
    mirror.style.width = textarea.offsetWidth + 'px';
    mirror.style.height = textarea.offsetHeight + 'px';
    mirror.style.whiteSpace = 'pre-wrap';
    
    // Append the mirror to the body
    document.body.appendChild(mirror);
    
    // Create content up to the cursor position with a span marker
    const textBeforeCursor = text.substring(0, position);
    const textAfterCursor = text.substring(position) || ' '; // Add a space if at the end
    
    mirror.innerHTML = 
      escapeHTML(textBeforeCursor) + 
      '<span id="cursor-position-marker" style="display:inline-block;width:0px;height:0px;overflow:hidden"></span>' + 
      escapeHTML(textAfterCursor);
    
    // Set the same scroll position
    mirror.scrollTop = originalScrollTop;
    mirror.scrollLeft = originalScrollLeft;
    
    // Get the marker position
    const marker = mirror.querySelector('#cursor-position-marker');
    const markerRect = marker.getBoundingClientRect();
    const mirrorRect = mirror.getBoundingClientRect();
    const textareaRect = textarea.getBoundingClientRect();
    
    // Clean up
    document.body.removeChild(mirror);
    
    // Return coordinates relative to the textarea
    return {
      top: markerRect.top - mirrorRect.top + textarea.scrollTop,
      left: markerRect.left - mirrorRect.left + textarea.scrollLeft
    };
  };
  
  // Helper function to escape HTML
  const escapeHTML = (text) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>');
  };

  const handleSelectSuggestion = (selected: any) => {
    const storedFormulas =
      JSON.parse(localStorage.getItem("customFormulas")) || [];

    const formulaMatch = storedFormulas.find(
      (formula: any) => formula.name === selected
    );
    let newCode;
    if (formulaMatch) {
      newCode = code.replace(/[\w]+$/, `(${formulaMatch.expression})`);
    } else {
      // Regular parameter selection
      newCode = code.replace(/[\w]+$/, selected.replace(/\s+/g, "_") + " ");
    }
    setCode(newCode);
    setSelectedIndex(-1);
    setSuggestions([]);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };
  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    }

    if (e.key === "Enter" && selectedIndex !== -1) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedIndex]);
    }

    if (e.key === "Escape") {
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  };
  const runCode = () => {
    try {
      const paramEntries = Object.entries(parameterValues)
        .map(([key, value]) => `let ${key.replace(/\s+/g, "_")} = ${value};`)
        .join("\n");

      const compiled = Babel.transform(
        `(() => { ${paramEntries}; return (${code}); })()`,
        { presets: ["es2015"], sourceType: "script" }
      ).code;


      // Execute the compiled code
      const result = new Function(`return ${compiled}`)();

      setOutput(result !== undefined ? result : "No return value");
    } catch (error) {
      console.error("Compilation Error:", error);
      setOutput("Error: Invalid Expression");
    }
  };
  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div className="taskbar">
        <span className="taskbar-title">My Compiler</span>
        <button className="compile-button" onClick={runCode}>
          Compile
        </button>
      </div>

      <div 
        className="code-input-container" 
        ref={containerRef}
        style={{ position: 'relative' }}
      >
        <textarea
          ref={textareaRef}
          rows={10}
          cols={40}
          placeholder="Start typing... ()=>{Tenure * Monthly_Payment}..eg "
          value={code}
          onChange={handleCodeChange}
          onKeyDown={handleKeyDown}
          className="code-input light-placeholder"
        />

        {suggestions.length > 0 && (
          <ul
            className="suggestions-box"
            style={{
              position: "absolute",
              top: `${cursorPosition.top}px`,
              left: `${cursorPosition.left}px`,
              zIndex: 10,
            }}
          >
            {suggestions.map((item, index) => {
              const isFormula = typeof item === "object"; // Custom formulas are stored as objects
              return (
                <li
                  key={index}
                  onClick={() =>
                    handleSelectSuggestion(isFormula ? item.name : item)
                  }
                  className={`suggestion-item ${
                    index === selectedIndex ? "active" : ""
                  }`}
                  style={{
                    cursor: "pointer",
                    padding: "5px",
                    background: index === selectedIndex ? "#ddd" : "white",
                    fontWeight: isFormula ? "bold" : "normal", // Make formulas bold
                  }}
                >
                  {isFormula ? `📌 ${item.name}` : item}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <br />

      <div className="output-box">
        <strong>Output:</strong> {output}
      </div>
    </div>
  );
};
