import { request } from "undici";

export async function toolCall(name: string, params: any) {
  const response = await request("http://localhost:3001/tools/" + name, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await response.body.json();
  if (!response.ok) throw new Error(data.error || "Tool failed");
  return data;
}
