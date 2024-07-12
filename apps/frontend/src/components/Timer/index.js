import moment from "moment";
import React, { useEffect, useState } from "react";
import "./styles.css";
export const Timer = ({
  startTime,
  mode,
  countdown,
  message,
  className,
  startText,
  endText,
  countdownEndTrigger,
  countdownStartTrigger,
  customComponent,
}) => {
  const [seconds, setSeconds] = useState(-1);

  // useEffect(() => {
  //   if (startTime) {
  //     const time = new Date(startTime);
  //     setSeconds(
  //       Math.abs(parseInt(Date.now() / 1000) - parseInt(time.getTime() / 1000))
  //     );
  //   }
  // }, [startTime]);

  useEffect(() => {
    if (mode === "countdown") {
      if (countdown && startTime) {
        const st = new Date(startTime);
        const time = new Date(st.getTime() + countdown);
        const s = parseInt(time.getTime() / 1000) - parseInt(Date.now() / 1000);
        if (s > 0) {
          setSeconds(s);
        } else setSeconds(0);
      }
    } else if (startTime) {
      const time = new Date(startTime);
      setSeconds(
        Math.abs(parseInt(Date.now() / 1000) - parseInt(time.getTime() / 1000))
      );
    }
  }, [mode, startTime, countdown]);

  useEffect(() => {
    let interval = null;
    if (seconds > 0) {
      interval = setInterval(() => {
        mode === "countdown"
          ? setSeconds((seconds) => seconds - 1)
          : setSeconds((seconds) => seconds + 1);
      }, 1000);
    } else if (seconds === 0) {
      if (countdownEndTrigger) {
        countdownEndTrigger();
      }
    }

    return () => clearInterval(interval);
  }, [seconds, mode]);

  return customComponent ? (
    customComponent(seconds)
  ) : (
    <span className={`text-start text-2xl font-extrabold ${className}`}>
      {`${startText ? startText : ""}${
        seconds >= 3600
          ? moment.utc(seconds * 1000).format("HH:mm:ss")
          : moment.utc(seconds * 1000).format("mm:ss")
      }${endText ? endText : ""}`}
    </span>
  );
};
