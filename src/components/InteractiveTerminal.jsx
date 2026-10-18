import { useState } from "react";
import { LockKeyhole, RotateCcw, Terminal as TerminalIcon } from "lucide-react";
import "./InteractiveTerminal.css";

const initialDirs = [
  "/",
  "/home",
  "/home/dickson",
  "/home/dickson/Desktop",
  "/home/dickson/Documents",
  "/home/dickson/Downloads",
  "/home/dickson/labs",
  "/home/dickson/labs/linux-basics",
  "/home/dickson/labs/networking",
  "/home/dickson/labs/forensics",
  "/home/dickson/labs/web-security",
  "/tmp",
  "/opt",
  "/etc",
  "/root",
];

const initialFiles = {
  "/home/dickson/focus.txt":
    "cybersecurity\nnetwork security\nLinux & systems\nsecurity labs\nautomation\ncontinuous learning",
  "/home/dickson/Documents/README.txt":
    "Welcome to Dickson's virtual Parrot OS terminal.\nType help to see available commands.",
  "/home/dickson/Desktop/welcome.txt":
    "Welcome to the interactive Linux practice lab!",
  "/home/dickson/labs/README.txt":
    "CYBERSECURITY PRACTICE LABS\n\nChoose a directory:\nlinux-basics\nnetworking\nforensics\nweb-security\n\nThese exercises use simulated outputs only.",
  "/home/dickson/labs/linux-basics/README.txt":
    "LINUX BASICS\n\nObjectives:\n1. Navigate with pwd, ls and cd.\n2. Create files with touch.\n3. Create directories with mkdir.\n4. Write and read files with echo and cat.\n\nTry: mkdir practice\ntouch practice/notes.txt",
  "/home/dickson/labs/networking/README.txt":
    "NETWORKING LAB\n\nExplore simulated network information.\nTry: ip addr\nTry: ping 192.0.2.10\nTry: nmap 192.0.2.10\n\nNo real network traffic is sent.",
  "/home/dickson/labs/networking/nmap-lab.txt":
    "SIMULATED NMAP EXERCISE\n\nRun: nmap 192.0.2.10\nRun: nmap -sV 192.0.2.10\n\nLearn what hosts, ports and services mean. Results are fictional and no scan is performed.",
  "/home/dickson/labs/forensics/README.txt":
    "DIGITAL FORENSICS LAB\n\nLearn evidence handling, hashes and file integrity.\nTry: hash evidence.txt\n\nThis is an educational simulation, not a forensic acquisition tool.",
  "/home/dickson/labs/web-security/README.txt":
    "WEB SECURITY LAB\n\nStudy input validation, authentication, security headers and safe testing.\nAll examples must remain within authorized practice environments.",
  "/etc/os-release":
    "PRETTY_NAME=\"Parrot Security (Simulated)\"\nID=parrot\nVERSION_ID=\"7.x-lab\"",
};

const helpText = [
  "Available commands:",
  "  help                 Show this help",
  "  ls [path]            List directory contents",
  "  cd [path]            Change directory",
  "  pwd                  Print current directory",
  "  whoami               Show current user",
  "  cat <file>           Read a file",
  "  mkdir <directory>    Create a directory",
  "  touch <file>         Create an empty file",
  '  echo "text" > file   Write text to a file',
  "  echo \"text\" >> file  Append text to a file",
  "  clear                Clear terminal output",
  "  history              Show commands entered",
  "  uname                Show simulated system information",
  "  ip addr              Show simulated network interfaces",
  "  ping <host>          Show simulated connectivity results",
  "  nmap [options] <host> Simulate a port scan",
  "  whois <domain>       Show sample domain lookup data",
  "  hash <file>          Explain simulated file hashing",
  "  sudo <command>       Simulate elevated permissions",
  "  reset-lab            Restore the original virtual filesystem",
  "",
  "This is a safe simulation. Commands never run on a real OS.",
];

function normalizePath(path, cwd) {
  if (path === "~") path = "/home/dickson";
  else if (path.startsWith("~/")) path = `/home/dickson/${path.slice(2)}`;
  const parts = (path.startsWith("/") ? path : `${cwd}/${path}`).split("/");
  const resolved = [];

  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") resolved.pop();
    else resolved.push(part);
  }

  return `/${resolved.join("/")}`;
}

function parentPath(path) {
  if (path === "/") return "/";
  const parts = path.split("/");
  parts.pop();
  return parts.join("/") || "/";
}

function basename(path) {
  return path.split("/").filter(Boolean).pop() || "/";
}

function tokenize(command) {
  return command.match(/"[^"]*"|'[^']*'|>>|>|[^\s]+/g)?.map((part) => {
    if (
      (part.startsWith('"') && part.endsWith('"')) ||
      (part.startsWith("'") && part.endsWith("'"))
    ) {
      return part.slice(1, -1);
    }
    return part;
  }) ?? [];
}

export default function InteractiveTerminal() {
  const [cwd, setCwd] = useState("/home/dickson");
  const [dirs, setDirs] = useState(initialDirs);
  const [files, setFiles] = useState(initialFiles);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [entries, setEntries] = useState([
    {
      command: "",
      cwd: "/home/dickson",
      output: [
        "Parrot Security — interactive practice terminal",
        "A safe, simulated Linux environment.",
        'Type "help" to get started.',
        "",
      ],
    },
  ]);

  function execute(rawCommand) {
    const command = rawCommand.trim();
    if (!command) return;

    setHistory((previous) => [...previous, command]);
    setHistoryIndex(-1);

    if (command === "clear") {
      setEntries([]);
      setInput("");
      return;
    }

    if (command === "reset-lab") {
      setCwd("/home/dickson");
      setDirs(initialDirs);
      setFiles(initialFiles);
      setEntries([
        {
          command,
          cwd: "/home/dickson",
          output: ["Virtual lab reset. All changes have been restored."],
        },
      ]);
      setInput("");
      return;
    }

    let nextCwd = cwd;
    let nextDirs = [...dirs];
    let nextFiles = { ...files };
    let output = [];
    let privileged = false;
    let args = tokenize(command);

    const fail = (message) => {
      output.push(message);
    };

    const run = (parts, elevated = false) => {
      if (!parts.length) return;

      let [cmd, ...argv] = parts;
      let target;

      if (cmd === "sudo") {
        if (!argv.length) {
          fail("usage: sudo <command>");
          return;
        }
        if (argv[0] === "sudo") {
          fail("sudo: nested elevation is not supported in this lab");
          return;
        }
        output.push("[sudo] Simulated authentication successful.");
        output.push("[sudo] Running in virtual root context only.");
        run(argv, true);
        return;
      }

      const isProtected = (path) =>
        path === "/root" ||
        path.startsWith("/root/") ||
        path === "/etc" ||
        path.startsWith("/etc/") ||
        path === "/opt" ||
        path.startsWith("/opt/");

      const checkPermission = (path) => {
        if (isProtected(path) && !elevated) {
          fail(`Permission denied: ${path}. Try sudo for simulated root access.`);
          return false;
        }
        return true;
      };

      switch (cmd) {
        case "help":
          output.push(...helpText);
          break;

        case "pwd":
          output.push(nextCwd);
          break;

        case "whoami":
          output.push(elevated ? "root (simulated)" : "dickson");
          break;

        case "uname":
          output.push("Linux parrot 6.x-lab #1 SMP x86_64 GNU/Linux (simulated)");
          break;

        case "history":
          output.push(...history.map((item, index) => `  ${index + 1}  ${item}`));
          output.push(`  ${history.length + 1}  ${command}`);
          break;

        case "ls": {
          const showAll = argv.includes("-a") || argv.includes("-la") || argv.includes("-al");
          const pathArg = argv.find((arg) => !arg.startsWith("-")) || ".";
          target = normalizePath(pathArg, nextCwd);

          if (!checkPermission(target)) break;
          if (nextFiles[target] !== undefined) {
            output.push(basename(target));
            break;
          }
          if (!nextDirs.includes(target)) {
            fail(`ls: cannot access '${pathArg}': No such file or directory`);
            break;
          }

          const children = [
            ...nextDirs
              .filter((dir) => dir !== target && parentPath(dir) === target)
              .map(basename),
            ...Object.keys(nextFiles)
              .filter((file) => parentPath(file) === target)
              .map(basename),
          ];

          output.push(...(showAll ? [".", "..", ...children] : children));
          if (!children.length && !showAll) output.push("(empty directory)");
          break;
        }

        case "cd": {
          const destination = argv[0] || "/home/dickson";
          target = normalizePath(destination, nextCwd);

          if (!checkPermission(target)) break;
          if (!nextDirs.includes(target)) {
            fail(`bash: cd: ${destination}: No such file or directory`);
          } else {
            nextCwd = target;
          }
          break;
        }

        case "cat": {
          if (!argv.length) {
            fail("usage: cat <file>");
            break;
          }

          target = normalizePath(argv[0], nextCwd);
          if (!checkPermission(target)) break;

          if (nextFiles[target] === undefined) {
            fail(`cat: ${argv[0]}: No such file or directory`);
          } else {
            output.push(...(nextFiles[target].split("\n")));
          }
          break;
        }

        case "mkdir": {
          const recursive = argv.includes("-p");
          const paths = argv.filter((arg) => arg !== "-p");

          if (!paths.length) {
            fail("usage: mkdir [-p] <directory>");
            break;
          }

          for (const pathArg of paths) {
            target = normalizePath(pathArg, nextCwd);

            if (!checkPermission(target)) continue;
            if (nextDirs.includes(target) || nextFiles[target] !== undefined) {
              if (recursive && nextDirs.includes(target)) continue;
              fail(`mkdir: cannot create directory '${pathArg}': File exists`);
              continue;
            }

            const parent = parentPath(target);
            if (!nextDirs.includes(parent)) {
              if (recursive) {
                const missing = [];
                let current = target;

                while (current !== "/" && !nextDirs.includes(current)) {
                  missing.unshift(current);
                  current = parentPath(current);
                }

                if (!checkPermission(target)) continue;
                nextDirs.push(...missing);
              } else {
                fail(`mkdir: cannot create directory '${pathArg}': No such file or directory`);
                continue;
              }
            } else {
              nextDirs.push(target);
            }

            output.push(`created directory: ${target}`);
          }
          break;
        }

        case "touch": {
          if (!argv.length) {
            fail("usage: touch <file>");
            break;
          }

          for (const pathArg of argv) {
            target = normalizePath(pathArg, nextCwd);

            if (!checkPermission(target)) continue;
            if (!nextDirs.includes(parentPath(target))) {
              fail(`touch: cannot touch '${pathArg}': No such directory`);
              continue;
            }

            if (nextDirs.includes(target)) {
              fail(`touch: '${pathArg}' is a directory`);
              continue;
            }

            if (nextFiles[target] === undefined) {
              nextFiles[target] = "";
              output.push(`created file: ${target}`);
            } else {
              output.push(`updated timestamp (simulated): ${target}`);
            }
          }
          break;
        }

        case "echo": {
          const operatorIndex = parts.findIndex((part) => part === ">" || part === ">>");

          if (operatorIndex === -1) {
            output.push(argv.join(" "));
            break;
          }

          if (operatorIndex === parts.length - 1) {
            fail("bash: missing file name after redirection");
            break;
          }

          const text = parts.slice(1, operatorIndex).join(" ");
          const operator = parts[operatorIndex];
          const fileArg = parts[operatorIndex + 1];
          target = normalizePath(fileArg, nextCwd);

          if (!checkPermission(target)) break;
          if (!nextDirs.includes(parentPath(target))) {
            fail(`bash: ${fileArg}: No such directory`);
            break;
          }
          if (nextDirs.includes(target)) {
            fail(`bash: ${fileArg}: Is a directory`);
            break;
          }

          nextFiles[target] =
            operator === ">>" && nextFiles[target] !== undefined
              ? `${nextFiles[target]}${nextFiles[target] ? "\n" : ""}${text}`
              : text;
          output.push(`wrote to ${target}`);
          break;
        }

        case "ip": {
          if (argv[0] !== "addr" && argv[0] !== "a") {
            fail("Usage: ip addr");
            break;
          }
          output.push(
            "1: lo: <LOOPBACK,UP> mtu 65536",
            "    inet 127.0.0.1/8 scope host lo",
            "2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500",
            "    inet 192.0.2.20/24 scope global eth0",
            "    (SIMULATED interface; no real network details)"
          );
          break;
        }

        case "ping": {
          if (!argv.length) {
            fail("Usage: ping <host>");
            break;
          }
          output.push(
            `PING ${argv[0]} (simulated)`,
            "64 bytes from simulated-host: icmp_seq=1 ttl=64 time=1.00 ms",
            "64 bytes from simulated-host: icmp_seq=2 ttl=64 time=1.10 ms",
            "--- simulated ping statistics ---",
            "2 packets transmitted, 2 received, 0% packet loss",
            "Note: no packets were sent over a real network."
          );
          break;
        }

        case "nmap": {
          const host = argv.filter((arg) => !arg.startsWith("-")).pop();
          if (!host) {
            fail("Usage: nmap [options] <host>");
            break;
          }
          output.push(
            `Starting simulated Nmap scan for ${host}`,
            "Host is up (simulated latency: 0.001s).",
            "",
            "PORT     STATE SERVICE",
            "22/tcp   open  ssh",
            "80/tcp   open  http",
            "443/tcp  open  https",
            "",
            "Scan complete: fictional training results only.",
            "No DNS lookup, connection, or network scan was performed."
          );
          break;
        }

        case "whois": {
          if (!argv.length) {
            fail("Usage: whois <domain>");
            break;
          }
          output.push(
            `Domain lookup: ${argv[0]}`,
            "Registrar: Example Registrar (fictional)",
            "Creation Date: 2020-01-01 (sample data)",
            "Status: educational demonstration only",
            "No external lookup was performed."
          );
          break;
        }

        case "hash": {
          if (!argv.length) {
            fail("Usage: hash <file>");
            break;
          }
          target = normalizePath(argv[0], nextCwd);
          if (!checkPermission(target)) break;
          if (nextFiles[target] === undefined) {
            fail(`hash: ${argv[0]}: No such file or directory`);
          } else {
            output.push(`File: ${target}`);
            output.push("Hash calculation is not implemented in this simulation.");
            output.push("For real evidence work, use a trusted SHA-256 tool on a local copy.");
          }
          break;
        }

        case "sha256sum": {
          if (!argv.length) {
            fail("Usage: sha256sum <file>");
            break;
          }
          target = normalizePath(argv[0], nextCwd);
          if (!checkPermission(target)) break;
          if (nextFiles[target] === undefined) {
            fail(`sha256sum: ${argv[0]}: No such file or directory`);
          } else {
            output.push("SHA-256 is not implemented; no digest was calculated.");
          }
          break;
        }

        default:
          fail(`bash: ${cmd}: command not found. Type 'help' for available commands.`);
      }
    };

    run(args, privileged);

    setCwd(nextCwd);
    setDirs(nextDirs);
    setFiles(nextFiles);
    setEntries((previous) => [
      ...previous,
      {
        command,
        cwd,
        output: output.length ? output : [" "],
      },
    ]);
    setInput("");
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      execute(input);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!history.length) return;
      const nextIndex =
        historyIndex === -1
          ? history.length - 1
          : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex]);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setInput("");
      } else {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    }
  }

  const displayPath = (path) =>
    path === "/home/dickson"
      ? "~"
      : path.startsWith("/home/dickson/")
        ? `~/${path.slice("/home/dickson/".length)}`
        : path;

  return (
    <div className="terminal-card interactive-terminal">
      <div className="terminal-top">
        <div className="terminal-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <TerminalIcon size={13} className="it-terminal-icon" />
        <small> dickson@parrot:{displayPath(cwd)}</small>
        <span className="it-lab-label">SAFE LAB</span>
        <button
          type="button"
          className="it-reset"
          onClick={() => execute("reset-lab")}
          title="Reset virtual lab"
          aria-label="Reset virtual lab"
        >
          <RotateCcw size={13} />
        </button>
        <span className="terminal-lock" title="Simulated environment">
          <LockKeyhole size={13} />
        </span>
      </div>

      <div className="it-screen" onClick={(event) => {
        if (event.target === event.currentTarget) {
          event.currentTarget.querySelector("input")?.focus();
        }
      }}>
        {entries.map((entry, index) => (
          <div className="it-entry" key={index}>
            {entry.command && (
              <div className="it-command-line">
                <span className="terminal-green">dickson@parrot</span>
                <span>:</span>
                <span className="terminal-blue">{displayPath(entry.cwd)}</span>
                <span>$ {entry.command}</span>
              </div>
            )}
            {entry.output.map((line, lineIndex) => (
              <div className="it-output" key={lineIndex}>{line || "\u00a0"}</div>
            ))}
          </div>
        ))}

        <form className="it-input-row" onSubmit={(event) => {
          event.preventDefault();
          execute(input);
        }}>
          <label className="it-prompt" htmlFor="it-command-input">
            <span className="terminal-green">dickson@parrot</span>
            <span>:</span>
            <span className="terminal-blue">{displayPath(cwd)}</span>
            <span>$</span>
          </label>
          <input
            id="it-command-input"
            aria-label="Enter a simulated Linux command"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <span className="it-cursor" aria-hidden="true" />
        </form>
      </div>
      <div className="it-footer">
        <span><span className="it-live-dot" /> INTERACTIVE LINUX LAB</span>
        <span>Type <b>help</b> to explore</span>
      </div>
    </div>
  );
}
