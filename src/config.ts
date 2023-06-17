import Readline from "readline/promises";
import fs from "fs/promises";
import fss from "fs";

process.stdin.setEncoding("utf-8")
const readline = Readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    removeHistoryDuplicates: true
});

async function question(prompt: string | (() => string), validator: (output: string) => boolean = a => true) {
    let retval = "";
    while(true) {
        let p = "";
        if(typeof(prompt) == "string") p = prompt;
        else p = prompt();
        retval = await readline.question(p);
        let success = !(retval == "" || retval == " " || (!Boolean(retval))) && validator(retval);
        if(success) break;
    }

    return retval;
}

async function questionAndSaveToConfig() {
    console.log('\r\n')
    console.log("╔═════════════════════════════════════╗");
    console.log("║ It seems that you haven't configure ║");
    console.log("║    user_config.json, don't worry!   ║");
    console.log("║   Just follow this questionaire to  ║");
    console.log("║       complete QRIS Simulator       ║");
    console.log("╚═════════════════════════════════════╝");
    console.log("")


    console.log("◀════▌ QRIS Required Information ▐════▶");
    const apiKey = await question(
        "╔❓ Provided API Key (mocked) : ",
        a => {
            if(a.length >= 7) return true;
            console.error(`╚═══❌ API Key Must be >= 8 in length, given ${a.length}`)
            return false;
        }
    );
    console.log("╚═══✅ Api Key Set !");
    const mID = await question(
        "╔❓ Provided mID (mocked) : ",
        a => {
            if(a.length >= 6) return true;
            console.error(`╚═══❌ mID Must be >= 6 in length, given ${a.length}`)
            try { parseInt(a, 10) }
            catch {
                console.error(`╚═══❌ mID Must be a valid integer, given ${a.length}`)
                return false
            }
            return false;
        }
    );
    console.log("╚═══✅ mID Set ! ");
    console.log();
    console.log("◀═════▌ Server Required Configs ▐═════▶");
    const port = await question(
        "╔❓ PORT to run this server : ",
        a => {
            if(a.length < 1) {
                console.error(`╚═══❌ port must be >= 1 digits`)
                return false;
            }
            if(a.length > 5) {
                console.error(`╚═══❌ port must be <= 5 digits`)
                return false;
            }

            for(let char of a.toUpperCase()) {
                if(!"0123456789abcdefABCDEF".includes(char)) {
                    console.error(`╚═══❌ port must be a valid number`);
                    return false;
                };
            }

            let numberType = "integer";
            for(let char of a.toUpperCase()) {
                if("abcdefABCDEF".includes(char)) {
                    numberType = "hexadecimal";
                    break;
                }
            }
            if(a.length == 15) {
                numberType = "binary";
                for(let char of a.toUpperCase()) {
                    if("23456789".includes(char)) {
                        numberType = "integer";
                        break;
                    }
                }
            }
            let radix = 10;
            let parsed = 0;
            if(numberType == "integer") radix = 10;
            if(numberType == "binary") radix = 2;
            if(numberType == "hexadecimal") radix = 16;
            try {
                parsed = parseInt(a.replace(",", "").replace(".", "").toUpperCase(), radix)
            } catch {
                console.error(`╚═══❌ port must be a valid integer`);
                return false
            }
            if(parsed <= 0 || parsed > 65535) {
                console.error(`╚═══❌ port must be between 1 and 65535 (inclusive)`);
                return false
            }
            return true;
        }
    )

    let numberType = "integer";
    for(let char of port.toUpperCase()) {
        if(["abcdefABCDEF"].includes(char)) {
            numberType = "hexadecimal";
            break;
        }
    }
    if(port.length == 15) {
        numberType = "binary";
        for(let char of port.toUpperCase()) {
            if(["23456789"].includes(char)) {
                numberType = "integer";
                break;
            }
        }
    }
    let radix = 10;
    let parsedPort = 0;
    if(numberType == "integer") radix = 10;
    if(numberType == "binary") radix = 2;
    if(numberType == "hexadecimal") radix = 16;
    parsedPort = parseInt(port.replace(",", "").replace(".", "").toUpperCase(), radix)
    console.log("╚═══✅ server Port Set !");

    function ___() {
        let sec = ["0", "1", "100"][Math.ceil((Math.random() * 3)-1)]
        let las = Math.ceil((Math.random() * 254) + 1)
        return `╔❓ Hostname to run this server (if possible use your local ip address like 192.168.${sec}.${las} or 0.0.0.0) : `;
    }
    const hostname = await question(
        ___,
        a => {
            if(a.toLowerCase() == "localhost") return true;
            if(a.toLowerCase() == "0.0.0.0") return true;
            if(a.toLowerCase() == "127.0.0.1") return true;
            const splittedPort = a.split(".");
            if(splittedPort.length != 4) {
                console.error(`╚═══❌ hostname must have 4 number separated by dot (.)`);
                return false;
            }
            
            for(let i=0; i<splittedPort.length; i++) {
                try {
                    let b = parseInt(splittedPort[i], 10);
                    if(b < 0 || b >= 256) {
                        console.error(`╚═══❌ hostname must have 4 integer ranged from 1 to 255 (inclusive)`);    
                        return false;
                    }
                }
                catch {
                    console.error(`╚═══❌ hostname must have 4 VALID integer separated by dot (.)`);
                    return false;
                }
            }
            return true;
        }
    )
    if(hostname.toLowerCase() == "localhost" || hostname == "127.0.0.1") {
        console.log("║");
        console.log("╠═❕ you are using localhost, if you want");
        console.log("╠═❕ to simulate payment, makesure to open");
        console.log("╠═❕ URL provided with the QR Code with");
        console.log("╠═❕ your computer appropriate url, please");
        console.log("╠═❕ consult with networking resources to");
        console.log("╠═❕ resolve this");
        console.log("║");
    }
    console.log("╚═══✅ server Hostname Set !");

    await fs.writeFile(
        "user_config.json",
        JSON.stringify({
            apiKey,
            mID: parseInt(mID, 10),
            port: parsedPort,
            hostname
        }, null, 2),
        {
            encoding: "utf-8"
        }
    );
}

async function getConfiguration(): Promise<{ apiKey: string, mID: number, port: number, hostname: string }> {
    const file = await fs
        .readFile("user_config.json", { encoding: "utf-8" })
        .then(value => value)
        .catch(_ => null);
    
    if(!file) {
        console.error("File Not Found!");
        await questionAndSaveToConfig();
        return await getConfiguration();
    }

    const jsonified = JSON.parse(file) as { apiKey: string | null | undefined, mID: number | null | undefined, port: number | null | undefined, hostname: string | null | undefined };
    const __fieldcheck = [
        jsonified.apiKey, jsonified.mID, jsonified.port, jsonified.hostname
    ];

    if(__fieldcheck.includes(null) || __fieldcheck.includes(undefined) || __fieldcheck.includes("") || __fieldcheck.includes(" ")) {
        console.log(__fieldcheck)
        await questionAndSaveToConfig();
        return await getConfiguration();
    }
    return {
        apiKey: jsonified.apiKey as string,
        mID: jsonified.mID as number,
        port: jsonified.port as number,
        hostname: jsonified.hostname as string
    }
}

export function getConfigurationSync() {
    const file = fss.readFileSync("user_config.json", { encoding: "utf-8" });
    const jsonified = JSON.parse(file) as { apiKey: string | null | undefined, mID: number | null | undefined, port: number | null | undefined, hostname: string | null | undefined };
    return {
        apiKey: jsonified.apiKey as string,
        mID: jsonified.mID as number,
        port: jsonified.port as number,
        hostname: jsonified.hostname as string
    }
}

export default getConfiguration;