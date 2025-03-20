const dbTimeToUtcTimestamp = (date) => {
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
};
const hexToTime = (h) => {
  return new Date(parseInt(h, 16) * 1000);
};

const substractSecondsFromCurrentDate = (s) =>{
  var t = new Date();
  t.setSeconds(t.getSeconds() - s);
  return new Date(t);
}

module.exports = { dbTimeToUtcTimestamp, hexToTime,substractSecondsFromCurrentDate };
