const Wheel = (() => {
  const TAU = Math.PI * 2;
  const PALETTE = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4',
    '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990', '#dcbeff', '#9a6324', '#800000'];

  const SEG_ANGLE = n => TAU / n;

  const color = (i, n) => {
    if (i === n - 1 && n > 1 && n % PALETTE.length === 1) return PALETTE[(i + 1) % PALETTE.length];
    return PALETTE[i % PALETTE.length];
  };

  const winnerIndex = (rotation, n) => {
    const rel = (((TAU * 0.75 - rotation) % TAU) + TAU) % TAU;
    return Math.floor(rel / SEG_ANGLE(n)) % n;
  };

  const dark = hex => { const v = parseInt(hex.slice(1), 16); return (0.299 * (v >> 16) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255)) < 140; };

  const easeOut = t => 1 - Math.pow(1 - t, 4);

  const truncate = (ctx, text, max) => {
    if (ctx.measureText(text).width <= max) return text;
    let s = text;
    while (s.length > 1 && ctx.measureText(s + '…').width > max) s = s.slice(0, -1);
    return s + '…';
  };

  const create = canvas => {
    const ctx = canvas.getContext('2d');
    const inst = { rotation: 0, spinning: false, choices: [] };
    let size = 0;

    inst.resize = () => {
      const dpr = window.devicePixelRatio || 1;
      size = canvas.clientWidth || 300;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      inst.draw();
    };

    inst.setChoices = arr => {
      inst.choices = arr.slice();
      inst.draw();
    };

    inst.draw = () => {
      const n = inst.choices.length;
      const c = size / 2, r = c - 10;
      ctx.clearRect(0, 0, size, size);

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.3)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(c, c, r, 0, TAU);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.restore();

      if (n === 0) {
        ctx.beginPath();
        ctx.arc(c, c, r, 0, TAU);
        ctx.fillStyle = '#ccc';
        ctx.fill();
        ctx.fillStyle = '#555';
        ctx.font = `${Math.max(12, r / 8)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Add choices', c, c);
      } else {
        const seg = SEG_ANGLE(n);
        const fontSize = Math.min(16, Math.max(10, 30 - n));
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < n; i++) {
          const a0 = inst.rotation + i * seg, a1 = a0 + seg;
          ctx.beginPath();
          ctx.moveTo(c, c);
          ctx.arc(c, c, r, a0, a1);
          ctx.closePath();
          ctx.fillStyle = color(i, n);
          ctx.fill();
          if (n > 1) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          ctx.save();
          ctx.translate(c, c);
          ctx.rotate(a0 + seg / 2);
          ctx.fillStyle = dark(color(i, n)) ? '#fff' : '#222';
          const max = r * 0.8 - 16;
          let lines = [inst.choices[i]], fs = fontSize;
          if (ctx.measureText(lines[0]).width > max) {
            const s = lines[0], mid = s.length / 2;
            const cut = [...s].reduce((best, ch, k) => ch === ' ' && Math.abs(k - mid) < Math.abs(best - mid) ? k : best, -1);
            if (cut > 0) lines = [s.slice(0, cut), s.slice(cut + 1)];
          }
          const wide = () => Math.max(...lines.map(l => ctx.measureText(l).width)) > max;
          while (fs > 10 && wide()) ctx.font = `bold ${--fs}px sans-serif`;
          lines.forEach((l, k) => ctx.fillText(truncate(ctx, l, max), r - 14, (k - (lines.length - 1) / 2) * fs * 1.15));
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.restore();
        }
      }

      ctx.beginPath();
      ctx.arc(c, c, r, 0, TAU);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(c, c, r * 0.08, 0, TAU);
      ctx.fillStyle = '#333';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(c - 14, 0);
      ctx.lineTo(c + 14, 0);
      ctx.lineTo(c, 28);
      ctx.closePath();
      ctx.fillStyle = '#d32f2f';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    inst.spin = ({ durationMs = 5000, onDone, target } = {}) => {
      const n = inst.choices.length;
      if (inst.spinning || n < 2) return;
      inst.spinning = true;
      const start = inst.rotation;
      const turns = TAU * Math.floor(4 + Math.random() * 3);
      const end = target == null ? Math.random() * TAU
        : ((TAU * 0.75 - (target + 0.5 + (Math.random() - 0.5) * 0.6) * SEG_ANGLE(n)) % TAU + TAU) % TAU;
      const delta = turns + ((end - start) % TAU + TAU) % TAU;
      const t0 = performance.now();
      const tick = now => {
        const t = Math.min(1, (now - t0) / durationMs);
        inst.rotation = start + delta * easeOut(t);
        inst.draw();
        if (t < 1) return requestAnimationFrame(tick);
        inst.rotation = ((inst.rotation % TAU) + TAU) % TAU;
        inst.spinning = false;
        inst.draw();
        if (onDone) onDone(winnerIndex(inst.rotation, inst.choices.length));
      };
      requestAnimationFrame(tick);
    };

    window.addEventListener('resize', inst.resize);
    inst.resize();
    return inst;
  };

  return { PALETTE, SEG_ANGLE, winnerIndex, create };
})();

if (typeof window !== 'undefined') window.Wheel = Wheel;
if (typeof module !== 'undefined') module.exports = Wheel;
