import express from "express";
import dotenv from "dotenv";
dotenv.config();

const apiKey = "EOOEMOW4YR6QNB07";

class AquaLinkAPI {
    constructor() {
        this.refreshToken = "";
        this.accessToken = "";
        this.userId = "";
        this.authToken = "";
        this.idToken = "";
        this.sessionId = "";
        this.updateTokens();
        setInterval(() => this.updateTokens(), 1800000);
    }

    async handleFetchErrors(response) {
        if (!response.ok) {
            const error = new Error(`HTTP error! Status: ${response.status}`);
            throw error;
        }
        return response;
    }

    async updateTokens() {
        try {
            const response = await fetch("https://prod.zodiac-io.com/users/v1/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: process.env.EMAIL,
                    password: process.env.PASSWORD
                })
            });
            await this.handleFetchErrors(response);
            const json = await response.json();
            this.refreshToken = json.userPoolOAuth.RefreshToken;
            this.accessToken = json.userPoolOAuth.AccessToken;
            this.userId = json.id;
            this.authToken = json.authentication_token;
            this.idToken = json.userPoolOAuth.IdToken;
            this.sessionId = json.session_id;
        } catch (error) {
            throw error;
        }
    }

    async getDevices() {
        try {
            const response = await fetch(`https://r-api.iaqualink.net/devices.json?api_key=${apiKey}&authentication_token=${this.authToken}&user_id=${this.userId}&timestamp=${Date.now()}`, {
                method: "GET",
                headers: {
                    "user-agent": "okhttp/3.14.7",
                    "Content-Type": "application/json",
                }
            });
            await this.handleFetchErrors(response);
            const json = await response.json();
            return json;
        } catch (error) {
            throw error;
        }
    }

    async getDeviceData(name) {
        try {
            const devices = await this.getDevices();
            const device = devices.find(device => device.name === name);
            return device;
        } catch (error) {
            throw error;
        }
    }

    async toggleFilterPump(device, actionIds) {
        try {
            const response = await fetch(`https://prm.iaqualink.net/v2/webtouch/command`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `${this.idToken}`,
                },
                body: JSON.stringify({
                    dt: Date.now(),
                    command: "17",
                    actionID: actionIds.actionIdMasterId
                })
            });
            await this.handleFetchErrors(response);
            return response.status === 200;
        } catch (error) {
            throw error;
        }
    }

    async togglePoolLight(device, actionIds) {
        try {
            const response = await fetch(`https://prm.iaqualink.net/v2/webtouch/command`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `${this.idToken}`,
                },
                body: JSON.stringify({
                    dt: Date.now(),
                    command: "23",
                    actionID: actionIds.actionIdMasterId
                })
            });
            await this.handleFetchErrors(response);
            return response.status === 200;
        } catch (error) {
            throw error;
        }
    }


    async getActionIds(initialActionId) {
        try {
            const response = await fetch(`https://prm.iaqualink.net/v2/webtouch/init?actionID=${initialActionId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.idToken}`,
                }
            });
            await this.handleFetchErrors(response);
            const json = await response.json();
            return json;
        } catch (error) {
            throw error;
        }
    }

    async getDeviceStats(device) {
        try {
            const response = await fetch(`https://p-api.iaqualink.net/v1/mobile/session.json`, {
                headers: {
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    "actionID": "command",
                    "command": "get_home",
                    "serial": device.serial_number,
                    sessionID: this.sessionId,
                })
            });
            await this.handleFetchErrors(response);
            const json = await response.json();
            return json;
        } catch (error) {
            throw error;
        }
    }
}

const app = express();
const aquaLinkAPI = new AquaLinkAPI();

app.get(`/:secret/getTemperatures`, async (req, res) => {
    if (req.params.secret !== process.env.SECRET) {
        res.status(403).json({ error: "Forbidden" });
        return;
    }
    try {
        const device = await aquaLinkAPI.getDeviceData(process.env.DEVICE);
        const deviceStats = await aquaLinkAPI.getDeviceStats(device);

        const list = deviceStats.home_screen.map(hsItem => {
            const name = Object.keys(hsItem)[0];
            return {
                name: name,
                value: hsItem[name]
            };
        });

        const poolTemp = list.find(item => item.name === "pool_temp");
        const airTemp = list.find(item => item.name === "air_temp");
        res.json({
            pool: poolTemp.value,
            air: airTemp.value
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/:secret/toggleFilterPump", async (req, res) => {
    if (req.params.secret !== process.env.SECRET) {
        res.status(403).json({ error: "Forbidden" });
        return;
    }
    try {
        const device = await aquaLinkAPI.getDeviceData(process.env.DEVICE);
        const actionIds = await aquaLinkAPI.getActionIds(process.env.ACTION);
        await aquaLinkAPI.toggleFilterPump(device, actionIds);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/:secret/togglePoolLight", async (req, res) => {
    if (req.params.secret !== process.env.SECRET) {
        res.status(403).json({ error: "Forbidden" });
        return;
    }
    try {
        const device = await aquaLinkAPI.getDeviceData(process.env.DEVICE);
        const actionIds = await aquaLinkAPI.getActionIds(process.env.ACTION);
        await aquaLinkAPI.togglePoolLight(device, actionIds);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(3000, () => {
    console.log("Listening on port 3000");
});
