import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";

interface CalculatorProps {
  onClose: () => void;
  onUse: (value: string) => void;
}

export function Calculator({ onClose, onUse }: CalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);

  const handleNumber = useCallback(
    (num: string) => {
      setDisplay((prev) => {
        if (resetNext || prev === "0") {
          setResetNext(false);
          return num;
        }
        return prev + num;
      });
    },
    [resetNext]
  );

  const handleDecimal = useCallback(() => {
    setDisplay((prev) => {
      if (resetNext) {
        setResetNext(false);
        return "0.";
      }
      if (prev.includes(".")) return prev;
      return prev + ".";
    });
  }, [resetNext]);

  function formatResult(val: number): string {
    if (!isFinite(val)) return "0";
    const str = parseFloat(val.toFixed(10)).toString();
    return str.length > 12 ? val.toExponential(4) : str;
  }

  const handleOperator = useCallback(
    (op: string) => {
      const current = parseFloat(display);
      if (prevValue !== null && operator && !resetNext) {
        let result: number;
        switch (operator) {
          case "+": result = prevValue + current; break;
          case "-": result = prevValue - current; break;
          case "\u00d7": result = prevValue * current; break;
          case "\u00f7": result = current !== 0 ? prevValue / current : 0; break;
          default: result = current;
        }
        setDisplay(formatResult(result));
        setPrevValue(result);
      } else {
        setPrevValue(current);
      }
      setOperator(op);
      setResetNext(true);
    },
    [display, prevValue, operator, resetNext]
  );

  const handleEquals = useCallback(() => {
    if (prevValue === null || !operator) return;
    const current = parseFloat(display);
    let result: number;
    switch (operator) {
      case "+": result = prevValue + current; break;
      case "-": result = prevValue - current; break;
      case "\u00d7": result = prevValue * current; break;
      case "\u00f7": result = current !== 0 ? prevValue / current : 0; break;
      default: result = current;
    }
    setDisplay(formatResult(result));
    setPrevValue(null);
    setOperator(null);
    setResetNext(true);
  }, [display, prevValue, operator]);

  const handleClear = useCallback(() => {
    setDisplay("0");
    setPrevValue(null);
    setOperator(null);
    setResetNext(false);
  }, []);

  const handlePercent = useCallback(() => {
    const current = parseFloat(display);
    setDisplay(formatResult(current / 100));
    setResetNext(true);
  }, [display]);

  const handleToggleSign = useCallback(() => {
    setDisplay((prev) => {
      const val = parseFloat(prev);
      return formatResult(val * -1);
    });
  }, []);

  const handlePress = (label: string) => {
    switch (label) {
      case "C": handleClear(); break;
      case "\u00b1": handleToggleSign(); break;
      case "%": handlePercent(); break;
      case "=": handleEquals(); break;
      case ".": handleDecimal(); break;
      case "+": case "-": case "\u00d7": case "\u00f7": handleOperator(label); break;
      default: handleNumber(label); break;
    }
  };

  const isOp = (label: string) => ["+", "-", "\u00d7", "\u00f7"].includes(label);

  const buttons = [
    ["C", "\u00b1", "%", "\u00f7"],
    ["7", "8", "9", "\u00d7"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "="],
  ];

  const handleUse = () => {
    const val = parseFloat(display);
    if (val > 0) {
      onUse(val.toFixed(2));
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col max-w-md mx-auto">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">Calculator</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex-1 flex flex-col justify-end p-4 gap-3">
        {/* Display */}
        <div className="text-right px-2 pb-2">
          <p className="text-4xl font-bold tabular-nums text-foreground truncate">
            {display}
          </p>
        </div>

        {/* Buttons */}
        <div className="grid gap-2">
          {buttons.map((row, ri) => (
            <div key={ri} className="grid grid-cols-4 gap-2">
              {row.map((label) => (
                <button
                  key={label}
                  onClick={() => handlePress(label)}
                  className={`
                    h-14 rounded-xl text-xl font-semibold transition-colors active:scale-95
                    ${label === "0" ? "col-span-2" : ""}
                    ${label === "=" ? "bg-primary text-primary-foreground" : ""}
                    ${isOp(label) ? "bg-orange-500 text-white active:bg-orange-600" : ""}
                    ${["C", "\u00b1", "%"].includes(label) ? "bg-muted text-foreground" : ""}
                    ${!isOp(label) && !["C", "\u00b1", "%", "="].includes(label) ? "bg-card border border-border text-foreground" : ""}
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Use result button */}
        <Button
          className="w-full h-12 text-base font-semibold mt-1 active:scale-[0.98] transition-transform"
          onClick={handleUse}
          disabled={parseFloat(display) <= 0}
        >
          <Check className="mr-2 h-5 w-5" />
          Use ${parseFloat(display) > 0 ? parseFloat(display).toFixed(2) : "0.00"}
        </Button>
      </div>
    </div>
  );
}
