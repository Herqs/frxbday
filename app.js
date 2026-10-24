'use strict';

const CHOICES = [
  'Svajoniu kelione 10000e',
  'Gucci tase 5000e',
  '1 Metus Redas uz tave dirba (neikainomajam)',
  'Balenciaga shades 1000e',
  'Svajoniu koncas, betkurioje salyje (no price range)',
  'Treatwell cekis 100e',
  'Butas Kaune 250000e',
  'Gyvunu prieglauda 1M e',
];
const DURATION_MS = 5000;

const $ = id => document.getElementById(id);
const canvas = $('wheel');
const wheel = Wheel.create(canvas);
wheel.setChoices(CHOICES);

function spin() {
  if (wheel.spinning) return;
  $('spin').disabled = true;
  const r = $('result');
  r.classList.remove('show');
  r.textContent = '';
  wheel.spin({
    durationMs: DURATION_MS,
    target: CHOICES.findIndex(c => c.startsWith('Treatwell')),
    onDone(i) {
      r.textContent = CHOICES[i];
      void r.offsetWidth;
      r.classList.add('show');
      $('spin').disabled = false;
    },
  });
}

$('spin').addEventListener('click', spin);
canvas.addEventListener('click', spin);
canvas.tabIndex = 0;
canvas.setAttribute('role', 'button');
canvas.addEventListener('keydown', e => {
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); spin(); }
});
