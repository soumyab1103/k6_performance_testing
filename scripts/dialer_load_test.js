import http from "k6/http";
import { check, sleep } from "k6";
import { readCSV } from "./utils.js";

export const options = {
  scenarios: {
    stress: {
      executor: "ramping-vus",
      startVUs: 10,
      stages: [
        { duration: "30s", target: 50 },
        { duration: "30s", target: 100 },
        { duration: "30s", target: 150 },
        { duration: "30s", target: 200 },
        { duration: "30s", target: 250 },
        { duration: "30s", target: 275 },
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    checks: ["rate > 0.95"],
    http_req_duration: ["p(95) < 800"],
  },
}

const users = readCSV("../data/agents.csv");

export default function () {
  const user = users[(__VU - 1) % users.length];
  const loginurl = "https://schrodinger.labs.dpdzero.com/api/token";
  const payload = `username=${encodeURIComponent(user.email.trim())}&password=${encodeURIComponent(user.password.trim())}`;
  const params = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  let res = http.post(loginurl, payload, params);
  //console.log("Status:", res.status);
  //console.log("Response:", res.body);
  
  check(res, {
        "status is 200": (r) => r.status === 200,
    });
  sleep(1);
}

export function handleSummary(data) {
  return {
    "summary_${Date.now()}.json": JSON.stringify(data, null, 2),
  };
}





