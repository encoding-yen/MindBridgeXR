const API_BASE_URL = "http://127.0.0.1:8000";

export async function startSession(userId) {
  const response = await fetch(`${API_BASE_URL}/sessions/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to start session");
  }

  return data;
}

export async function endSession(sessionId, totalScore = 0, exerciseScores = []) {
  console.log("Calling end session API:", sessionId, totalScore, exerciseScores);

  const response = await fetch(`${API_BASE_URL}/sessions/end`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session_id: Number(sessionId),
      total_score: Number(totalScore),
      exercise_scores: exerciseScores,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to end session");
  }

  return data;
}

export async function getUserSessionStats(userId) {
  const response = await fetch(`${API_BASE_URL}/sessions/stats/${userId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load session stats");
  }

  return data;
}

export async function getLatestSession(userId) {
  const response = await fetch(`${API_BASE_URL}/sessions/latest/${userId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load latest session");
  }

  return data;
}

export async function getUserSessions(userId) {
  const response = await fetch(`${API_BASE_URL}/sessions/user/${userId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to load sessions");
  }

  return data;
}