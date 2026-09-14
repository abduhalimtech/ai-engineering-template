#!/usr/bin/env node
"use strict";

/**
 * Blocks high-risk shell actions. Fail-open on parse errors so normal
 * development is not frozen if the hook cannot read stdin.
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

function deny(userMessage, agentMessage) {
  reply({
    permission: "deny",
    user_message: userMessage,
    agent_message: agentMessage,
  });
}

function ask(userMessage, agentMessage) {
  reply({
    permission: "ask",
    user_message: userMessage,
    agent_message: agentMessage,
  });
}

function allow() {
  reply({ permission: "allow" });
}

function compact(command) {
  return String(command || "").replace(/\s+/g, " ").trim();
}

function isGitPush(cmd) {
  return /\bgit(?:\s+-C\s+\S+)*\s+push\b/i.test(cmd);
}

function hasForceFlag(cmd) {
  return /(?:^|\s)(--force-with-lease|--force|-f)(?=\s|$)/.test(cmd);
}

function pushesProtectedBranch(cmd) {
  if (/\bHEAD:(main|master)\b/i.test(cmd)) return true;
  if (/(?:^|\s)(?:origin|upstream)\s+(?:main|master)\b/i.test(cmd)) {
    return true;
  }
  if (/\bgit(?:\s+-C\s+\S+)*\s+push\s+(?:main|master)\b/i.test(cmd)) {
    return true;
  }
  return false;
}

function isRootRecursiveDelete(cmd) {
  const lower = cmd.toLowerCase();
  if (/\brm\b/.test(lower) && /-[a-z]*r[a-z]*f[a-z]*|-[a-z]*f[a-z]*r[a-z]*/.test(lower)) {
    if (/(?:^|\s)\/(?:\s|$|\*|\\)/.test(cmd)) return true;
    if (/(?:^|\s)~(?:\/|\s|$)/.test(cmd)) return true;
  }
  if (/\bremove-item\b/.test(lower) && /-recurse/.test(lower) && /-force/.test(lower)) {
    if (/[c-z]:\\(?:\s|$)/i.test(cmd) || /(?:^|\s)-path\s+['\"]?[c-z]:\\/i.test(cmd)) {
      return true;
    }
  }
  if (/(?:^|\s)(?:rd|rmdir)\s+\/s\s+\/q\s+[c-z]:\\(?:\s|$)/i.test(cmd)) return true;
  return false;
}

function isSecretDump(cmd) {
  const lower = cmd.toLowerCase();
  const secretFile =
    /(?:^|[\\/\s'"])(\.env(?:\.(?:production|prod|local|staging|secrets?))?|credentials\.json|.*serviceaccount.*\.json|id_rsa|.*\.(?:pem|p12|pfx))(?:\s|$|['"])/;
  if (!secretFile.test(lower)) return false;
  if (/\.env\.example\b/.test(lower)) return false;
  return (
    /(?:^|\s)(?:cat|type|more|less|get-content|gc|bat)\b/.test(lower) ||
    /\bgit\s+show\b/.test(lower) ||
    /\bprintenv\b/.test(lower)
  );
}

function isDestructiveDb(cmd) {
  const lower = cmd.toLowerCase();
  return (
    /\bdrop\s+database\b/.test(lower) ||
    /\bdrop\s+schema\b/.test(lower) ||
    /\bdropdb\b/.test(lower)
  );
}

function isInfraDestroy(cmd) {
  const lower = cmd.toLowerCase();
  return (
    /\bterraform\s+destroy\b/.test(lower) ||
    /\bpulumi\s+destroy\b/.test(lower) ||
    /\bkubectl\s+delete\s+(namespace|ns)\b/.test(lower)
  );
}

function needsAsk(cmd) {
  const lower = cmd.toLowerCase();
  if (/\b(migrate:fresh|migrate:reset|prisma\s+migrate\s+reset)\b/.test(lower)) {
    return "Destructive database reset. Confirm this is not production.";
  }
  if (/\bgit\s+reset\s+--hard\b/.test(lower)) {
    return "Hard git reset discards local work. Confirm before continuing.";
  }
  if (
    /\bvercel\s+.*--prod\b/.test(lower) ||
    /\bfly(?:ctl)?\s+deploy\b/.test(lower) ||
    /\b(eb\s+deploy|cap\s+production)\b/.test(lower)
  ) {
    return "This looks like a production deploy. Human approval required.";
  }
  return null;
}

try {
  const input = JSON.parse(readStdin() || "{}");
  const command = compact(input.command);

  if (!command) allow();

  if (isGitPush(command) && hasForceFlag(command)) {
    deny(
      "Force-push is blocked by project hooks.",
      "Do not force-push. Recreate a normal commit/branch flow instead."
    );
  }

  if (isGitPush(command) && pushesProtectedBranch(command)) {
    deny(
      "Direct push to main/master is blocked.",
      "Push a feature branch and open a PR. Human merge only."
    );
  }

  if (isRootRecursiveDelete(command)) {
    deny(
      "Recursive delete of a filesystem root is blocked.",
      "This command matches a destructive wipe pattern and will not run."
    );
  }

  if (isSecretDump(command)) {
    deny(
      "Reading secret files via the shell is blocked.",
      "Do not print .env, credentials, or private keys. Use key names from .env.example only."
    );
  }

  if (isDestructiveDb(command)) {
    deny(
      "DROP DATABASE/SCHEMA is blocked.",
      "Do not run destructive database commands from the agent. Local test resets require human approval via an explicit, narrower command."
    );
  }

  if (isInfraDestroy(command)) {
    deny(
      "Infrastructure destroy commands are blocked.",
      "Do not destroy infra from the agent. Require explicit human execution."
    );
  }

  const askReason = needsAsk(command);
  if (askReason) {
    ask(askReason, askReason);
  }

  allow();
} catch {
  allow();
}
