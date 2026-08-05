const API_BASE_URL = "http://127.0.0.1:8000";

// NOTE: mock payment — no real processor wired up on the backend yet.
export async function mockPay(userId) {
  const response = await fetch(`${API_BASE_URL}/auth/mock-pay/${userId}`, {
    method: "POST",
    mode: "cors",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Payment failed");
  }

  return data;
}