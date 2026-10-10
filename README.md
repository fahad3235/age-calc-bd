# Age Calculator BD — বয়স ক্যালকুলেটর

A free, fully offline exact-age calculator. Enter a birth date and get the precise age in
**years, months and days** using proper calendar arithmetic (borrow logic) — not a naive
"total days ÷ 365" approximation.

## Problem

Most "age calculators" divide total days by 365.25 and produce wrong month/day figures,
and they mishandle leap-day birthdays. People need exact calendar age for forms,
retirement eligibility, school admission cutoffs, and "how old was I on date X" questions.

## Features

- **Exact age** in years · months · days (calendar borrow arithmetic)
- **Totals**: days lived, total months, total weeks
- **Weekday of birth** (EN/Bangla)
- **Next birthday countdown**: days remaining + the date and weekday it falls on
- **Age on a custom date**: "how old was I / will I be on X" (optional second date)
- **Validation**: no future birth dates, years limited to 1900–today, clear error messages
- **Full BN/EN UI toggle**, responsive mobile + desktop, empty state before input
- **100% offline** — zero network requests, nothing leaves the device

## Stack

Vanilla HTML, CSS and JavaScript. No build step, no framework, no dependencies.

## Prerequisites

Any modern browser. For the test suite: Python 3 and Playwright.

## Install

```bash
# Just open it — no install needed
cd age-calc-bd
python3 -m http.server 8000   # then open http://localhost:8000/
```

## Dev commands

```bash
python3 -m http.server 8000
```

## Env

None. There are no secrets, no API keys, no backend — the page makes zero network requests.

## Testing

```bash
cd /tmp/age-test   # script kept outside the repo per factory policy
python3 test.py
```

23 headless-Chromium checks, all passing, zero console/page errors:

- `2005-10-10` on `2026-10-10` → exactly `21 years · 0 months · 0 days`
- `2000-02-29` on `2026-02-28` → `25 years · 11 months · 30 days` (borrow logic)
- `2000-02-29` on `2025-02-28` → `24 years · 11 months · 30 days` (leap edge)
- Weekday of birth matches the OS `date` reference (`2026-10-10` = Saturday)
- Next-birthday countdown matches an independently computed Python `datetime` day count (217 days for the fixture)
- Birthday-today message; future/empty/pre-1900/invalid inputs rejected; as-of-before-birth rejected
- BN/EN toggle rewrites all labels; mobile 390px has no horizontal overflow
- Direct engine unit checks (`computeAge`, `totalDaysBetween`, `parseISODate`)

The suite uses the `?asof=YYYY-MM-DD` test hook to freeze "today" deterministically.

## Deployment

GitHub Pages compatible: static files, works from the repository root. Enable Pages with
source "Deploy from a branch", branch `main`, folder `/ (root)`.

## Limitations

- **Leap-day convention**: a Feb 29 birthday is observed on **Feb 28** in non-leap years
  (the common legal-birthday convention). Some people celebrate on Mar 1 instead; the
  app documents its choice in the UI and in `js/age.js`.
- **Borrow convention**: when the target day is earlier in the month than the birth day,
  the app borrows the whole previous calendar month (whatever its length), e.g. age from
  `2000-02-29` to `2026-02-28` is 25y 11m 30d. Other conventions (fixed 30-day months)
  give slightly different day counts.
- Age uses the device's local calendar/timezone; historical calendar reforms are not modeled.
- No persistent state — results are computed on demand and not saved.

## Status

✅ Complete. Tested 2026-10-10: 23/23 headless-Chrome checks, zero console errors.
MIT licensed.
