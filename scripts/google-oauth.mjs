import { google } from "googleapis";
import { readFileSync } from "fs";

try {
  const env = readFileSync(".env", "utf8");

  for (const line of env.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);

    if (!match || process.env[match[1]]) {
      continue;
    }

    process.env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
} catch {
  // The command can also run with environment variables provided by the shell.
}

const scopes = ["https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/spreadsheets"];
const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || "http://localhost:3001/api/google/oauth/callback";
const shopEmail = process.env.GOOGLE_SHOP_EMAIL || "okuma530@gmail.com";

const getRequiredEnv = (name) => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
};

const createClient = () =>
  new google.auth.OAuth2(getRequiredEnv("GOOGLE_OAUTH_CLIENT_ID"), getRequiredEnv("GOOGLE_OAUTH_CLIENT_SECRET"), redirectUri);

const command = process.argv[2];

if (command === "url") {
  const client = createClient();
  const url = client.generateAuthUrl({
    access_type: "offline",
    include_granted_scopes: true,
    login_hint: shopEmail,
    prompt: "consent",
    scope: scopes,
  });

  console.log(url);
} else if (command === "token") {
  const code = process.argv[3];

  if (!code) {
    throw new Error("Usage: npm run google:oauth:token -- YOUR_CODE");
  }

  const client = createClient();
  const { tokens } = await client.getToken(code);

  console.log("GOOGLE_OAUTH_REFRESH_TOKEN=" + (tokens.refresh_token ?? ""));

  if (!tokens.refresh_token) {
    console.log("No refresh token returned. Re-run the URL step and make sure prompt=consent is used.");
  }
} else {
  console.log("Usage:");
  console.log("  npm run google:oauth:url");
  console.log("  npm run google:oauth:token -- YOUR_CODE");
}
