import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const rawLine of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(join(process.cwd(), ".env"));
loadEnvFile(join(process.cwd(), ".env.local"));

const url = String(process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const secretKey = process.env.SUPABASE_SECRET_KEY || "";
if (!url || !secretKey) {
  console.error("SUPABASE_URL och SUPABASE_SECRET_KEY krävs för live-verifieringen.");
  process.exitCode = 1;
} else {
  const response = await fetch(`${url}/rest/v1/student_learning_progress?select=user_id&limit=0`, {
    headers: {
      Accept: "application/json",
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`student_learning_progress är inte tillgänglig (${response.status}): ${body.slice(0, 300)}`);
    process.exitCode = 1;
  } else {
    console.log("Verified live Supabase table student_learning_progress.");
  }
}
