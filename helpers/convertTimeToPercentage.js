export const convertFromUnixToPercent = (startTime, endTime) => {

    const currentTime = Math.round(Date.now() / 1000);
  
    const diff = Math.abs(startTime - endTime);
  
    const time_used = Math.abs(startTime - currentTime);
  
    const percentage = (time_used * 100) / diff;
  
    if (currentTime > endTime) {
  
      return 0;
  
    } else {
  
      return Math.round(100 - percentage);
  
    }
  
  };
  
  
  
  
  export const changeProgressColor = (percent) => {
  
    if (percent > 80) {
  
      return "success";
  
    } else if (percent < 80 && percent > 40) {
  
      return "normal";
  
    } else {
  
      return "exception";
  
    }
  
  };