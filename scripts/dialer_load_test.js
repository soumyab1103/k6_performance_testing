import http from "k6/http";
import { check, sleep } from "k6";

import { readCSV } from "./utils.js";

export const options = {
    vus: 50,       // 50 users because CSV has 50 rows
    duration: "1m",

};

const users = readCSV("../data/agents.csv");  // important path

export default function () {

    const user = users[(__VU - 1) % users.length];

    console.log(`VU ${__VU} logging in with ${user.email}`);

    const url = "https://schrodinger.labs.dpdzero.com/api/token";

    // Form-urlencoded payload
    const payload = `username=${encodeURIComponent(user.email.trim())}&password=${encodeURIComponent(user.password.trim())}`;
    
    const params = {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
        },
    };

    const res = http.post(url, payload, params);

    console.log("Payload being sent:", payload);
    console.log("Status code returned:", res.status);
    console.log("Response body:", res.body);

    // Extract token if login is successful
    if (res.status === 200) {
        const responseJson = res.json();
        const token = responseJson.access_token;
        console.log(`Token for ${user.email}: ${token}`);
    }

    check(res, {
        "status is 200": (r) => r.status === 200,
    });

    sleep(3);
}

export function handleSummary(data) {
    return {
        "summary.json": JSON.stringify(data, null, 2),
    };
}

