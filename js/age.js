// age.js — exact calendar date arithmetic for age-calc-bd.
//
// Core rule (borrow convention): age is computed as years/months/days by
// calendar units, not by dividing total days. When the target day is earlier
// in the month than the birth day, we "borrow" the full previous month
// (whatever length it has) instead of a fixed 30 days.
//
// Leap-day convention: a person born on Feb 29 is treated as turning a year
// older on Feb 28 in non-leap years (the "legal birthday" convention used in
// most jurisdictions). This is documented in the UI and README.
// Test hook: the app accepts ?asof=YYYY-MM-DD to override "today" so the
// test suite can assert deterministic results.

'use strict';

function isLeapYear(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function daysInMonth(y, m) {
  // m: 1-12
  const table = [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return table[m - 1];
}

// Parse 'YYYY-MM-DD' strictly; return {y,m,d} or null.
function parseISODate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((s || '').trim());
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3];
  if (mo < 1 || mo > 12) return null;
  if (d < 1 || d > daysInMonth(y, mo)) return null;
  return { y, m: mo, d };
}

function toDateParts(date) {
  return { y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate() };
}

function partsToDate(p) {
  return new Date(p.y, p.m - 1, p.d, 12, 0, 0, 0); // noon avoids DST edges
}

// Exact age: years, months, days between birth (inclusive) and target.
// Throws if target < birth.
function computeAge(birth, target) {
  let years = target.y - birth.y;
  let months = target.m - birth.m;
  let days = target.d - birth.d;

  if (days < 0) {
    // Borrow the whole previous calendar month of the TARGET date.
    months -= 1;
    let pm = target.m - 1, py = target.y;
    if (pm < 1) { pm = 12; py -= 1; }
    days += daysInMonth(py, pm);
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) throw new Error('target-before-birth');
  return { years, months, days };
}

// Whole days between two dates (target - birth), timezone-safe.
function totalDaysBetween(birthDate, targetDate) {
  const ms = partsToDate(toDateParts(targetDate)) - partsToDate(toDateParts(birthDate));
  return Math.round(ms / 86400000);
}

function totalMonthsOf(age) {
  return age.years * 12 + age.months;
}

// Next birthday on/after target (Date). Feb 29 -> Feb 28 in non-leap years.
function nextBirthday(birth, target) {
  const b = toDateParts(birth);
  const t = toDateParts(target);
  let y = t.y;
  let d = b.d, m = b.m;
  if (m === 2 && d === 29 && !isLeapYear(y)) d = 28;
  let cand = new Date(y, m - 1, d, 12, 0, 0, 0);
  if (cand < new Date(t.y, t.m - 1, t.d, 12, 0, 0, 0)) {
    y += 1;
    d = b.d;
    if (m === 2 && d === 29 && !isLeapYear(y)) d = 28;
    cand = new Date(y, m - 1, d, 12, 0, 0, 0);
  }
  return cand;
}

const WEEKDAYS_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const WEEKDAYS_BN = ['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'];
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_BN = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { isLeapYear, daysInMonth, parseISODate, toDateParts, partsToDate,
    computeAge, totalDaysBetween, totalMonthsOf, nextBirthday };
}
