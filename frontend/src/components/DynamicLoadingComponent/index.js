import { useEffect, useState } from "react";
import LocalLaundryServiceIcon from "@mui/icons-material/LocalLaundryService";
import LocalLaundryServiceOutlinedIcon from "@mui/icons-material/LocalLaundryServiceOutlined";
import "./styles.css";
import { Collapse, Slide } from "@mui/material";
import { useRef } from "react";
/**
 *
 * @param {object} param0
 * @param {Boolean} param0.onlyText
 * @param {Boolean} param0.showIcons
 * @param {Array<String>} param0.textSet
 * @returns
 */
export const DynamicLoadingComponent = ({
  textSet = ["Processing..."],
  showIcons,
  onlyText,
}) => {
  const [text, setText] = useState("Processing...");
  const [counter, setCounter] = useState(0);
  const [timer, setTimer] = useState(0);
  const containerRef = useRef(null);
  useEffect(() => {
    let textInterval = setInterval(() => {
      if (counter === textSet.length - 1) {
        setCounter(0);
      } else {
        setCounter(counter + 1);
      }
    }, 2000);
    return () => {
      clearInterval(textInterval);
    };
  }, [counter, textSet]);

  useEffect(() => {
    let iconInterval = setInterval(() => {
      setTimer(timer + 1);
    }, 500);
    return () => {
      clearInterval(iconInterval);
    };
  }, []);

  useEffect(() => {
    try {
      setText(textSet[counter]);
    } catch (error) {}
  }, [counter]);

  return onlyText ? (
    text
  ) : (
    <div
      className="flex flex-col justify-center items-center m-2 h-full dynamic_loading_component"
      ref={containerRef}
    >
      {showIcons && (
        <Collapse
          direction="left"
          in={Boolean(timer % 2)}
          mountOnEnter
          unmountOnExit
          container={containerRef.current}
        >
          <LocalLaundryServiceOutlinedIcon
            color="secondary"
            className="!text-6xl"
          />
        </Collapse>
      )}
      {showIcons && (
        <Collapse
          direction="left"
          in={!Boolean(timer % 2)}
          mountOnEnter
          unmountOnExit
          container={containerRef.current}
          className="!p-0 !m-0"
        >
          <LocalLaundryServiceIcon className="!text-6xl" color="secondary" />
        </Collapse>
      )}

      <span className="text-base font-semibold text-slate-500 mt-2">
        {text}
      </span>
    </div>
  );
};
