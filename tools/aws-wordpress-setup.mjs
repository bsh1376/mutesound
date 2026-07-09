#!/usr/bin/env node
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const defaultConfigPath = join(root, "tools", "mutesound-aws-wordpress.config.json");
const exampleConfigPath = join(root, "tools", "mutesound-aws-wordpress.config.example.json");

function parseOptions(argv) {
  const options = { command: argv[0] || "help", configPath: defaultConfigPath, execute: false };
  for (let i = 1; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--execute") {
      options.execute = true;
    } else if (arg === "--config") {
      options.configPath = resolve(argv[i + 1] || "");
      i += 1;
    } else if (arg === "--help" || arg === "-h") {
      options.command = "help";
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  return options;
}

function loadConfig(configPath) {
  const path = existsSync(configPath) ? configPath : exampleConfigPath;
  const config = JSON.parse(readFileSync(path, "utf8"));
  return { config, path, usingExample: path === exampleConfigPath };
}

function commandExists(name) {
  return spawnSync("which", [name], { stdio: "ignore" }).status === 0;
}

function run(name, args, options = {}) {
  const result = spawnSync(name, args, {
    cwd: options.cwd || root,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit"
  });
  if (result.status !== 0 && !options.allowFailure) {
    throw new Error(`${name} ${args.join(" ")} failed`);
  }
  return result;
}

function awsArgs(config, args) {
  return [...args, "--region", config.region];
}

function printCommand(name, args) {
  console.log(`$ ${[name, ...args].map((part) => (part.includes(" ") ? JSON.stringify(part) : part)).join(" ")}`);
}

function runAws(config, args, options) {
  const fullArgs = awsArgs(config, args);
  if (!options.execute) {
    printCommand("aws", fullArgs);
    return { stdout: "" };
  }
  return run("aws", fullArgs, { capture: true, allowFailure: options.allowFailure });
}

function readAwsJson(config, args, options = {}) {
  const result = runAws(config, [...args, "--output", "json"], { ...options, execute: true });
  if (result.status !== 0) return null;
  return JSON.parse(result.stdout || "{}");
}

function readAwsText(config, args, options = {}) {
  const result = runAws(config, [...args, "--output", "text"], { ...options, execute: true });
  if (result.status !== 0) return "";
  return result.stdout.trim();
}

function requireRealConfig(options, loaded) {
  if (!options.execute) return;
  if (loaded.usingExample) {
    throw new Error(`Create tools/mutesound-aws-wordpress.config.json before using --execute.`);
  }
}

function requireCostApproval(options) {
  if (!options.execute) return;
  if (process.env.MUTESOUND_AWS_APPROVE_COSTS !== "yes") {
    throw new Error("Set MUTESOUND_AWS_APPROVE_COSTS=yes before creating paid AWS resources.");
  }
}

function ensureAwsReady(config) {
  if (!commandExists("aws")) {
    throw new Error("AWS CLI is not installed or not in PATH.");
  }
  run("aws", ["sts", "get-caller-identity", "--region", config.region], { capture: true });
}

function showHelp() {
  console.log(`
MUTESOUND AWS WordPress automation

Usage:
  node tools/aws-wordpress-setup.mjs check
  node tools/aws-wordpress-setup.mjs plan
  node tools/aws-wordpress-setup.mjs apply --execute
  node tools/aws-wordpress-setup.mjs dns --execute
  node tools/aws-wordpress-setup.mjs deploy-wordpress --execute
  node tools/aws-wordpress-setup.mjs finish-domain --execute
  node tools/aws-wordpress-setup.mjs status
  node tools/aws-wordpress-setup.mjs wordpress

Safety:
  apply, dns, deploy-wordpress, and finish-domain only print guidance unless --execute is passed.
  apply also requires MUTESOUND_AWS_APPROVE_COSTS=yes because it can create paid AWS resources.

Config:
  cp tools/mutesound-aws-wordpress.config.example.json tools/mutesound-aws-wordpress.config.json
`);
}

function check(loaded) {
  const checks = [
    ["aws", commandExists("aws")],
    ["node", commandExists("node")],
    ["zip", commandExists("zip")],
    ["dig", commandExists("dig")]
  ];
  console.log(`Config: ${loaded.path}${loaded.usingExample ? " (example)" : ""}`);
  for (const [name, ok] of checks) {
    console.log(`${ok ? "OK" : "MISSING"} ${name}`);
  }
  if (commandExists("aws")) {
    const identity = run("aws", ["sts", "get-caller-identity", "--region", loaded.config.region, "--output", "json"], { capture: true, allowFailure: true });
    console.log(identity.status === 0 ? `OK aws auth ${identity.stdout.trim()}` : "MISSING aws auth");
  }
  console.log(`Plugin zip: ${loaded.config.pluginZipUrl}`);
}

function plan(config, options) {
  console.log("AWS Lightsail WordPress plan");
  runAws(config, [
    "lightsail", "create-instances",
    "--instance-names", config.projectName,
    "--availability-zone", config.availabilityZone,
    "--blueprint-id", config.blueprintId,
    "--bundle-id", config.bundleId,
    "--tags", `key=Project,value=${config.projectName}`
  ], options);
  runAws(config, ["lightsail", "allocate-static-ip", "--static-ip-name", config.staticIpName], options);
  runAws(config, ["lightsail", "attach-static-ip", "--static-ip-name", config.staticIpName, "--instance-name", config.projectName], options);
  for (const port of [80, 443]) {
    runAws(config, [
      "lightsail", "open-instance-public-ports",
      "--instance-name", config.projectName,
      "--port-info", `fromPort=${port},toPort=${port},protocol=tcp,cidrs=0.0.0.0/0`
    ], options);
  }
}

function instanceExists(config) {
  const result = runAws(config, ["lightsail", "get-instance", "--instance-name", config.projectName], {
    execute: true,
    capture: true,
    allowFailure: true
  });
  return result.status === 0;
}

function waitForRunning(config) {
  for (let i = 0; i < 30; i += 1) {
    const state = readAwsText(config, [
      "lightsail", "get-instance",
      "--instance-name", config.projectName,
      "--query", "instance.state.name"
    ], { allowFailure: true });
    if (state === "running") return;
    console.log(`Waiting for instance: ${state || "unknown"}`);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10000);
  }
  throw new Error("Instance did not reach running state within 5 minutes.");
}

function ensureStaticIp(config) {
  const existing = runAws(config, ["lightsail", "get-static-ip", "--static-ip-name", config.staticIpName], {
    execute: true,
    capture: true,
    allowFailure: true
  });
  if (existing.status !== 0) {
    runAws(config, ["lightsail", "allocate-static-ip", "--static-ip-name", config.staticIpName], { execute: true });
  }
  runAws(config, ["lightsail", "attach-static-ip", "--static-ip-name", config.staticIpName, "--instance-name", config.projectName], { execute: true });
}

function apply(config) {
  ensureAwsReady(config);
  if (!instanceExists(config)) {
    runAws(config, [
      "lightsail", "create-instances",
      "--instance-names", config.projectName,
      "--availability-zone", config.availabilityZone,
      "--blueprint-id", config.blueprintId,
      "--bundle-id", config.bundleId,
      "--tags", `key=Project,value=${config.projectName}`
    ], { execute: true });
  } else {
    console.log(`Instance already exists: ${config.projectName}`);
  }
  waitForRunning(config);
  ensureStaticIp(config);
  for (const port of [80, 443]) {
    runAws(config, [
      "lightsail", "open-instance-public-ports",
      "--instance-name", config.projectName,
      "--port-info", `fromPort=${port},toPort=${port},protocol=tcp,cidrs=0.0.0.0/0`
    ], { execute: true });
  }
  status(config);
}

function route53ChangeBatch(config, ipAddress) {
  return {
    Comment: `MUTESOUND Lightsail ${config.projectName}`,
    Changes: [config.domain, config.wwwDomain].map((name) => ({
      Action: "UPSERT",
      ResourceRecordSet: {
        Name: name.endsWith(".") ? name : `${name}.`,
        Type: "A",
        TTL: 300,
        ResourceRecords: [{ Value: ipAddress }]
      }
    }))
  };
}

function dns(config, options) {
  const ipAddress = options.execute
    ? readAwsText(config, ["lightsail", "get-static-ip", "--static-ip-name", config.staticIpName, "--query", "staticIp.ipAddress"])
    : "YOUR_STATIC_IP";
  if (!config.route53HostedZoneId) {
    console.log("Route 53 hosted zone id is empty. Add these A records at your domain registrar:");
    console.log(`A  @    ${ipAddress}`);
    console.log(`A  www  ${ipAddress}`);
    return;
  }
  const changeBatch = JSON.stringify(route53ChangeBatch(config, ipAddress));
  if (!options.execute) {
    printCommand("aws", ["route53", "change-resource-record-sets", "--hosted-zone-id", config.route53HostedZoneId, "--change-batch", changeBatch]);
    return;
  }
  const result = run("aws", [
    "route53", "change-resource-record-sets",
    "--hosted-zone-id", config.route53HostedZoneId,
    "--change-batch", changeBatch,
    "--output", "json"
  ], { capture: true });
  const change = JSON.parse(result.stdout);
  const changeId = change.ChangeInfo.Id;
  run("aws", ["route53", "wait", "resource-record-sets-changed", "--id", changeId]);
  console.log(`Route 53 change applied: ${changeId}`);
}

function status(config) {
  ensureAwsReady(config);
  const instance = readAwsJson(config, ["lightsail", "get-instance", "--instance-name", config.projectName], { allowFailure: true });
  const staticIp = readAwsJson(config, ["lightsail", "get-static-ip", "--static-ip-name", config.staticIpName], { allowFailure: true });
  console.log(`Instance: ${instance?.instance?.name || "missing"} ${instance?.instance?.state?.name || ""}`);
  console.log(`Static IP: ${staticIp?.staticIp?.ipAddress || "missing"} attached=${staticIp?.staticIp?.isAttached || false}`);
  if (commandExists("dig")) {
    for (const name of [config.domain, config.wwwDomain]) {
      const result = run("dig", ["+short", name], { capture: true, allowFailure: true });
      console.log(`DNS ${name}: ${result.stdout.trim() || "not resolved"}`);
    }
  }
}

function getStaticIpAddress(config) {
  return readAwsText(config, ["lightsail", "get-static-ip", "--static-ip-name", config.staticIpName, "--query", "staticIp.ipAddress"]);
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

function resolveSshKey(config) {
  if (config.sshKeyPath) {
    return resolve(root, config.sshKeyPath);
  }

  const keyDir = join(root, "tmp", "keys");
  const keyPath = join(keyDir, `lightsail-default-${config.region}.pem`);
  if (!existsSync(keyPath)) {
    mkdirSync(keyDir, { recursive: true });
    const result = run("aws", ["lightsail", "download-default-key-pair", "--region", config.region, "--output", "json"], { capture: true });
    const keyPair = JSON.parse(result.stdout || "{}");
    const rawKey = keyPair.privateKeyBase64 || "";
    const privateKey = rawKey.startsWith("-----BEGIN") ? rawKey : Buffer.from(rawKey, "base64").toString("utf8");
    if (!privateKey.startsWith("-----BEGIN")) {
      throw new Error("Could not read the Lightsail default private key.");
    }
    writeFileSync(keyPath, privateKey, { mode: 0o600 });
  }
  chmodSync(keyPath, 0o600);
  return keyPath;
}

function sshTarget(config) {
  const ipAddress = getStaticIpAddress(config);
  if (!ipAddress) {
    throw new Error("Static IP is missing. Run apply --execute first.");
  }
  return { ipAddress, target: `bitnami@${ipAddress}` };
}

function sshBaseArgs(config) {
  const keyPath = resolveSshKey(config);
  const { target } = sshTarget(config);
  return ["-o", "BatchMode=yes", "-o", "StrictHostKeyChecking=accept-new", "-i", keyPath, target];
}

function packagePlugin() {
  const wordpressDir = join(root, "wordpress");
  run("zip", ["-qr", "mutesound-landing.zip", "mutesound-landing"], { cwd: wordpressDir });
}

function deployWordPress(config, options) {
  if (!options.execute) {
    console.log("deploy-wordpress will package the local plugin, upload it over SSH, install it with WP-CLI, and set it as the homepage.");
    return;
  }
  ensureAwsReady(config);
  for (const name of ["ssh", "scp", "zip"]) {
    if (!commandExists(name)) {
      throw new Error(`${name} is not installed or not in PATH.`);
    }
  }

  packagePlugin();
  const keyPath = resolveSshKey(config);
  const { ipAddress, target } = sshTarget(config);
  run("scp", [
    "-o", "BatchMode=yes",
    "-o", "StrictHostKeyChecking=accept-new",
    "-i", keyPath,
    join(root, "wordpress", "mutesound-landing.zip"),
    `${target}:/tmp/mutesound-landing.zip`
  ]);

  const remoteScript = `
set -euo pipefail
WP="sudo /opt/bitnami/wp-cli/bin/wp --path=/opt/bitnami/wordpress"
$WP plugin install /tmp/mutesound-landing.zip --force --activate
/opt/bitnami/php/bin/php -l /opt/bitnami/wordpress/wp-content/plugins/mutesound-landing/mutesound-landing.php
PAGE_ID=$($WP post list --post_type=page --name=mutesound-landing --field=ID)
if [ -z "$PAGE_ID" ]; then
  PAGE_ID=$($WP post create --post_type=page --post_title="뮤트사운드 방음시공" --post_name=mutesound-landing --post_content="[mutesound_landing]" --post_status=publish --porcelain)
else
  $WP post update "$PAGE_ID" --post_title="뮤트사운드 방음시공" --post_content="[mutesound_landing]" --post_status=publish >/dev/null
fi
$WP option update show_on_front page >/dev/null
$WP option update page_on_front "$PAGE_ID" >/dev/null
$WP option update blogname MUTESOUND >/dev/null
$WP option update blogdescription "음악 학원 · 연습실 전문 방음 시공" >/dev/null
$WP option update timezone_string Asia/Seoul >/dev/null
$WP option update blog_public 1 >/dev/null
$WP post delete 2 --force >/dev/null 2>&1 || true
echo "WordPress deployed at http://${ipAddress}/"
`;
  run("ssh", [...sshBaseArgs(config), remoteScript]);
}

function digA(name) {
  if (!commandExists("dig")) return "";
  const result = run("dig", ["+short", name, "A"], { capture: true, allowFailure: true });
  return result.stdout.trim();
}

function finishDomain(config, options) {
  if (!options.execute) {
    console.log("finish-domain will verify DNS, run Bitnami bncert unattended, and set WordPress home/siteurl to HTTPS.");
    return;
  }
  ensureAwsReady(config);
  if (!config.sslEmail || config.sslEmail === "you@example.com") {
    throw new Error("Set sslEmail in tools/mutesound-aws-wordpress.config.json before running finish-domain.");
  }

  const ipAddress = getStaticIpAddress(config);
  const records = [config.domain, config.wwwDomain].map((name) => ({ name, value: digA(name) }));
  const mismatched = records.filter((record) => record.value !== ipAddress);
  if (mismatched.length > 0) {
    console.log(`Static IP: ${ipAddress}`);
    for (const record of records) {
      console.log(`DNS ${record.name}: ${record.value || "not resolved"}`);
    }
    throw new Error(`DNS must point ${config.domain} and ${config.wwwDomain} to ${ipAddress} before HTTPS can be issued.`);
  }

  const domains = `${config.domain} ${config.wwwDomain}`;
  const homeUrl = `https://${config.wwwDomain}`;
  const remoteScript = `
set -euo pipefail
sudo /opt/bitnami/bncert-tool --mode unattended --domains ${shellQuote(domains)} --email ${shellQuote(config.sslEmail)} --accept_tos 1 --enable_https_redirection 1 --enable_nonwww_to_www_redirection 1 --enable_www_to_nonwww_redirection 0
WP="sudo /opt/bitnami/wp-cli/bin/wp --path=/opt/bitnami/wordpress"
$WP option update home ${shellQuote(homeUrl)} >/dev/null
$WP option update siteurl ${shellQuote(homeUrl)} >/dev/null
echo "HTTPS configured at ${homeUrl}/"
`;
  run("ssh", [...sshBaseArgs(config), remoteScript]);
}

function wordpress(config) {
  console.log(`
WordPress deployment:

  node tools/aws-wordpress-setup.mjs deploy-wordpress --execute

After Gabia/DNS points both domains to the Lightsail static IP:

  node tools/aws-wordpress-setup.mjs finish-domain --execute

Bitnami password command:
  cat bitnami_application_password

HTTPS command:
  sudo /opt/bitnami/bncert-tool
`);
}

function main() {
  const options = parseOptions(process.argv.slice(2));
  if (options.command === "help") {
    showHelp();
    return;
  }
  const loaded = loadConfig(options.configPath);
  const config = loaded.config;
  if (options.command === "check") return check(loaded);
  if (options.command === "plan") return plan(config, { execute: false });
  if (options.command === "apply") {
    requireRealConfig(options, loaded);
    requireCostApproval(options);
    return options.execute ? apply(config) : plan(config, { execute: false });
  }
  if (options.command === "dns") {
    requireRealConfig(options, loaded);
    return dns(config, options);
  }
  if (options.command === "deploy-wordpress") {
    requireRealConfig(options, loaded);
    return deployWordPress(config, options);
  }
  if (options.command === "finish-domain") {
    requireRealConfig(options, loaded);
    return finishDomain(config, options);
  }
  if (options.command === "status") return status(config);
  if (options.command === "wordpress") return wordpress(config);
  throw new Error(`Unknown command: ${options.command}`);
}

try {
  main();
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
}
