const median = values => {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};

const sampleStats = samples => {
  const values = samples.filter(Number.isFinite);
  if (values.length < 3) {
    return null;
  }

  const center = median(values);
  if (center <= 0) {
    return null;
  }

  const mad = median(values.map(value => Math.abs(value - center)));
  return {
    median: center,
    relativeMadPercent: (mad / center) * 100,
  };
};

export const classifyBenchmarkSignal = (baseSamples, headSamples) => {
  const base = sampleStats(baseSamples);
  const head = sampleStats(headSamples);
  if (!base || !head) {
    return {
      deltaPercent: null,
      baseRelativeMadPercent: base?.relativeMadPercent ?? null,
      headRelativeMadPercent: head?.relativeMadPercent ?? null,
      noiseBandPercent: null,
      classification: 'insufficient-data',
    };
  }

  const deltaPercent = ((head.median - base.median) / base.median) * 100;
  const robustSigmaPercent = Math.hypot(
    base.relativeMadPercent * 1.4826,
    head.relativeMadPercent * 1.4826
  );
  const noiseBandPercent = Math.max(2, robustSigmaPercent * 2);
  const classification =
    deltaPercent > noiseBandPercent
      ? 'regression'
      : deltaPercent < -noiseBandPercent
        ? 'improvement'
        : 'inconclusive';

  return {
    deltaPercent,
    baseRelativeMadPercent: base.relativeMadPercent,
    headRelativeMadPercent: head.relativeMadPercent,
    noiseBandPercent,
    classification,
  };
};
