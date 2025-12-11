import http from "k6/http";
import { check, sleep } from "k6";

import { readCSV } from "./utils.js";

export const options = {
    vus: 50,       // 50 users because CSV has 50 rows
    duration: "1m",

};

const users = readCSV("../data/agents.csv");  // important path

export default function () {
    const user = users[__VU % users.length]; // each VU gets different user

    //const user = users[0];   // only 1 agent

    console.log(`VU ${__VU} logging in with ${user.username}`);

    const url = "https://tau.labs.dpdzero.com/login-with-password";

    const payload = JSON.stringify({
        email: user.username,
        password: user.password,

    
    });
    const params = {
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",   // optional but recommended
        },
    };

    const res = http.request("POST", url, payload, params);

    //console.log("Payload being sent:", payload);
    //console.log("Status code returned:", res.status);
    //console.log("Response body:", res.body);

    check(res, {
        "status is 200": (r) => r.status === 200,
    });

    sleep(3);
}

export function handleSummary(data) {
    return {
        "summary.json": JSON.stringify(data),
    };
}
