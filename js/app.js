'use strict';
// UI wiring for age-calc-bd. Test hook: ?asof=YYYY-MM-DD overrides "today".

let lang = 'en';
const $ = (id) => document.getElementById(id);

function qs(name) {
  const m = new RegExp('[?&]' + name + '=([^&]*)').exec(location.search);
  return m ? decodeURIComponent(m[1]) : null;
}

function todayParts() {
  const o = qs('asof');
  if (o) {
    const p = parseISODate(o);
    if (p) return p;
  }
  return toDateParts(new Date());
}

function fmtNum(n) { return n.toLocaleString('en-US'); }

function fmtDate(p, l) {
  const M = l === 'bn' ? MONTHS_BN : MONTHS_EN;
  return `${p.d} ${M[p.m - 1]} ${p.y}`;
}

function setError(msg) {
  const el = $('error');
  el.textContent = msg || '';
  el.style.display = msg ? 'block' : 'none';
}

function calculate() {
  setError(null);
  const t = STR[lang];
  const bRaw = $('birth').value;
  const aRaw = $('asof').value;

  const b = parseISODate(bRaw);
  if (!b) { setError(t.errInvalid); return; }
  if (b.y < 1900) { setError(t.errRange); return; }

  const now = todayParts();
  const nowDate = partsToDate(now);
  const birthDate = partsToDate(b);
  if (birthDate > nowDate) { setError(t.errFuture); return; }

  let target = now;
  if (aRaw) {
    const a = parseISODate(aRaw);
    if (!a) { setError(t.errInvalid); return; }
    if (partsToDate(a) < birthDate) { setError(t.errAsOfBefore); return; }
    target = a;
  }

  const age = computeAge(b, target);
  const targetDate = partsToDate(target);
  const days = totalDaysBetween(birthDate, targetDate);
  const nb = nextBirthday(birthDate, targetDate);
  const nbParts = toDateParts(nb);
  const daysTo = totalDaysBetween(targetDate, nb);

  $('empty').style.display = 'none';
  $('result').style.display = 'block';

  $('ageBig').textContent = `${age.years} ${t.years} · ${age.months} ${t.months} · ${age.days} ${t.days}`;
  $('ageOnLine').textContent = `${t.ageOn}: ${fmtDate(target, lang)}`;
  $('statDays').textContent = fmtNum(days);
  $('statMonths').textContent = fmtNum(totalMonthsOf(age));
  $('statWeeks').textContent = fmtNum(Math.floor(days / 7));
  $('statBorn').textContent = (lang === 'bn' ? WEEKDAYS_BN : WEEKDAYS_EN)[birthDate.getDay()]
    + ' · ' + fmtDate(b, lang);
  $('statNext').textContent = fmtDate(nbParts, lang);
  $('statNextSub').textContent = daysTo === 0 ? t.todayIsBday : `${fmtNum(daysTo)} ${t.inDays}`;
  $('lblDays').textContent = t.totalDays; $('lblMonths').textContent = t.totalMonths;
  $('lblWeeks').textContent = t.totalWeeks; $('lblBorn').textContent = t.bornOn;
  $('lblNext').textContent = t.nextBday;
}

function applyLang() {
  const t = STR[lang];
  document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
  $('title').textContent = t.title;
  $('subtitle').textContent = t.subtitle;
  $('lblBirth').textContent = t.birthLabel;
  $('lblAsof').textContent = t.asofLabel;
  $('asofHint').textContent = t.asofHint;
  $('calcBtn').textContent = t.calcBtn;
  $('clearBtn').textContent = t.clearBtn;
  $('emptyTitle').textContent = t.emptyTitle;
  $('emptyText').textContent = t.emptyText;
  $('leapNote').textContent = t.leapNote;
  $('madeLine').textContent = t.made;
  $('langBtn').textContent = t.lang;
  setError(null);
  if ($('result').style.display === 'block') calculate();
}

function clearAll() {
  $('birth').value = ''; $('asof').value = '';
  setError(null);
  $('result').style.display = 'none';
  $('empty').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  $('calcBtn').addEventListener('click', calculate);
  $('clearBtn').addEventListener('click', clearAll);
  $('langBtn').addEventListener('click', () => { lang = lang === 'en' ? 'bn' : 'en'; applyLang(); });
  ['birth', 'asof'].forEach(id => $(id).addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); }));
  applyLang();
});
