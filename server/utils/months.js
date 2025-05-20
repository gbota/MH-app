const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

function getMonthName(monthNumber) {
  return months[monthNumber - 1];
}

function getMonthNumber(monthName) {
  return months.indexOf(monthName) + 1;
}

module.exports = {
  months,
  getMonthName,
  getMonthNumber
}; 