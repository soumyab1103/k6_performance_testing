import http from "k6/http";
import { check, sleep } from "k6";
import { readCSV } from "./utils.js";

export const options = {
  scenarios: {
    stress: {
      executor: "ramping-vus",
      startVUs: 5,
      stages: [
        { duration: "30s", target: 50 },
        { duration: "30s", target: 100 },
        { duration: "30s", target: 150 },
        { duration: "30s", target: 200 },
        { duration: "30s", target: 220 },
      ],
      gracefulRampDown: "30s",
    },
  },

  
  thresholds: {
    checks: ["rate > 0.95"],
    http_req_duration: ["p(95) < 30000"],
  },
}
const users = readCSV("../data/agents.csv");

export default function () {
    
  const user = users[(__VU - 1) % users.length];
  const loginurl = "https://tst.labs.dpdzero.com/api/token";
  const payload = `username=${encodeURIComponent(user.email.trim())}&password=${encodeURIComponent(user.password.trim())}`;
  const params = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    timeout: "30s",
  };
  let res = http.post(loginurl, payload, params);

  if(res.status==200){
    const responseJson= res.json();
    if (!responseJson.access_token) {
    console.error("Token missing for user:", user.email);
    }
  }

  check(res, {
        "status is 200": (r) => r.status === 200,
    });
  sleep(1);
}
  
export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  return {
    [`summary_${timestamp}.json`]: JSON.stringify(data, null, 2),
  };
}





