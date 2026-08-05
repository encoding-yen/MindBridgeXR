export function calculateMovementMetrics(samples) {
  if (!samples || samples.length < 5) {
    return {
      posture: 0,
      control: 0,
      movementRange: 0,
      movementSpeed: 0,
      score: 0,
      status: "Collecting Data",
      statusType: "neutral",
    };
  }

  const pitches = samples.map((s) => s.pitch);
  const rolls = samples.map((s) => s.roll);
  const yaws = samples.map((s) => s.yaw);

  const pitchRange = Math.max(...pitches) - Math.min(...pitches);
  const rollRange = Math.max(...rolls) - Math.min(...rolls);
  const yawRange = Math.max(...yaws) - Math.min(...yaws);

  const movementRangeDegrees = Math.max(pitchRange, rollRange, yawRange);

  let totalChange = 0;

  for (let i = 1; i < samples.length; i++) {
    totalChange +=
      Math.abs(samples[i].pitch - samples[i - 1].pitch) +
      Math.abs(samples[i].roll - samples[i - 1].roll) +
      Math.abs(samples[i].yaw - samples[i - 1].yaw);
  }

  const averageChange = totalChange / (samples.length - 1);

  const posture = clamp(100 - Math.abs(average(rolls)) * 4, 0, 100);
  const control = clamp(100 - averageChange * 5, 0, 100);
  const movementRange = clamp((movementRangeDegrees / 45) * 100, 0, 100);
  const movementSpeed = averageChange;

  let score = 0;
  let status = "Needs Movement";
  let statusType = "bad";

  if (movementRangeDegrees >= 45 && control >= 65) {
    score = 3;
    status = "Correct";
    statusType = "good";
  } else if (movementRangeDegrees >= 30) {
    score = 2;
    status = "Good";
    statusType = "good";
  } else if (movementRangeDegrees >= 15) {
    score = 1;
    status = "Needs Improvement";
    statusType = "warning";
  }

  return {
    posture: Math.round(posture),
    control: Math.round(control),
    movementRange: Math.round(movementRange),
    movementSpeed: Number(movementSpeed.toFixed(2)),
    score,
    status,
    statusType,
  };
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}