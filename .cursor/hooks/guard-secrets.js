#!/usr/bin/env node
"use strict";

/**
 * Prevents secret files from being sent to the model.
 * Allows .env.example (key names only).
 */

function readStdin() {
  try {
    return require("fs").readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function reply(payload) {
  process.stdout.write(JSON.stringify(payload));
  process.exit(0);
}

try {
  const input = JSON.parse(readStdin() || "{}");
  const filePath = String(input.file_path || "").replace(/\\/g, "/");
  const base = filePath.split("/").pop() || "";
  const lower = base.toLowerCase();

  const blockedName =
    lower === ".env" ||
    /^\.env\.(production|prod|local|staging|secrets?)$/.test(lower) ||
    lower === "credentials.json" ||
    /serviceaccount.*\.json$/.test(lower) ||
    lower === "id_rsa" ||
    lower === "id_ed25519" ||
    /\.(pem|p12|pfx)$/.test(lower);

  const allowedExample = lower === ".env.example" || /\.env\..*\.example$/.test(lower);

  if (blockedName && !allowedExample) {
    reply({
      permission: "deny",
      user_message:
        "Refusing to read a secret file. Use .env.example for key names only; never load secret values into agent context.",
    });
  }

  reply({ permission: "allow" });
} catch {
  reply({ permission: "allow" });
}
