const form = document.getElementById('form');
const priceEl = document.getElementById('price');
const yearsEl = document.getElementById('years');
const resultEl = document.getElementById('result');
const residualEl = document.getElementById('residual');
const noteEl = document.getElementById('note');
const rowsEl = document.getElementById('rows');

const MAX_YEARS = 100;
const money = new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH', maximumFractionDigits: 2 });

function setError(input, message) {
  document.getElementById(input.id + '-err').textContent = message;
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  return !message;
}

function validate() {
  const price = parseFloat(priceEl.value);
  const years = Number(yearsEl.value);

  const priceOk = setError(priceEl,
    !isFinite(price) || price <= 0 ? 'Вкажіть, будь ласка, вартість більшу за нуль.' : '');
  const yearsOk = setError(yearsEl,
    yearsEl.value === '' || !Number.isInteger(years) || years < 0 || years > MAX_YEARS
      ? `Вкажіть, будь ласка, ціле число років від 0 до ${MAX_YEARS}.` : '');

  if (!priceOk) priceEl.focus();
  else if (!yearsOk) yearsEl.focus();
  return priceOk && yearsOk ? { price, years } : null;
}

// Метод спадного залишку: V(n) = V0 * (1 - r)^n
function calculate(price, years, rate) {
  const rows = [];
  let value = price;
  for (let year = 1; year <= years; year++) {
    const depreciation = value * rate;
    value -= depreciation;
    rows.push({ year, depreciation, value });
  }
  return { residual: value, rows };
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = validate();
  if (!data) { resultEl.hidden = true; return; }

  const rate = Number(form.elements.rate.value) / 100;
  const { residual, rows } = calculate(data.price, data.years, rate);

  residualEl.textContent = money.format(residual);
  noteEl.textContent = `За ${data.years} р. при ${rate * 100}% на рік авто втратить у вартості близько ${money.format(data.price - residual)}`;
  rowsEl.replaceChildren(...rows.map(r => {
    const tr = document.createElement('tr');
    [r.year, money.format(r.depreciation), money.format(r.value)].forEach(v => {
      const td = document.createElement('td');
      td.textContent = v;
      tr.appendChild(td);
    });
    return tr;
  }));
  resultEl.hidden = false;
  // перезапуск анімації появи при кожному новому розрахунку
  resultEl.classList.remove('show');
  void resultEl.offsetWidth;
  resultEl.classList.add('show');
});

[priceEl, yearsEl].forEach(el => el.addEventListener('input', () => setError(el, '')));
