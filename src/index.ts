import http from "http";
import express, { Request, Response, NextFunction } from "express";
import getConfiguration from "./config";
import { mixins_checkInvoice, mixins_createInvoice, mixins_makePayments, mixins_mockupPayment } from "./create_invoice";

let IS_BANNED = false;
function requireAuth(_expectedAPIKEY: string, _expectedMID: number) {
    async function __auth(req: Request, res: Response, next: NextFunction) {
        const _apikey = req.query.apikey as string | null | undefined;
        const _mID = req.query.mID as number | null | undefined;
    
        const __fieldcheck = [ _apikey, _mID ];
        if(__fieldcheck.includes(null) || __fieldcheck.includes(undefined) || __fieldcheck.includes("") || __fieldcheck.includes(" ") || __fieldcheck.includes(0) || __fieldcheck.includes("0")) return void res.status(400).json({
            status: "failed",
            data: {
                qris_status: "mandatory parameter is not valid"
            }
        });

        if(IS_BANNED) return void res.status(400).json({
            status: "failed",
            data: {
                qris_status: "your api key has been banned (what we do for you?)"
            }
        })

        if(_apikey as string != _expectedAPIKEY) return void res.status(401).json({
            status: "failed",
            data: {
                qris_status: "unauthorized"
            }
        });

        if(parseInt((_mID as number).toString(), 10) != _expectedMID) return void res.status(401).json({
            status: "failed",
            data: {
                qris_status: "unauthorized"
            }
        });

        next();
    }

    return __auth;
}

//******** Banning Mechanism *********************************************************************//
let START_DATE = new Date().getTime();
let USAGE_COUNT = 0;
function limitAPIUsage(req: Request, res: Response, next: NextFunction) {
    USAGE_COUNT++;
    if(USAGE_COUNT < 200) return next();

    USAGE_COUNT = 0;
    IS_BANNED = true;
    return void res.status(400).json({
        status: "failed",
        data: {
            qris_status: "your api key has been banned (what we do for you?)"
        }
    })
}

/* Interval to check whenever it past 30 minutes, it reset USAGE_COUNT to 0 */
setInterval(() => {
    let currentDate = new Date().getTime();
    if((currentDate - START_DATE) < (600000 * 3)) return; // 30 minute

    // Reset everything
    START_DATE = new Date().getTime();
    USAGE_COUNT = 0;
}, 60000)
//************************************************************************************************//

getConfiguration()
.then(async CONFIG => {
    const app = express();
    const server = http.createServer(app);
    
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(express.static( "public" ));
    app.set("view engine", "ejs");
    
    app.get("/restapi/qris/show_qris.php", requireAuth(CONFIG.apiKey, parseInt(CONFIG.mID.toString())), mixins_createInvoice);
    app.get("/restapi/qris/checkpaid_qris.php", requireAuth(CONFIG.apiKey, parseInt(CONFIG.mID.toString())), limitAPIUsage, mixins_checkInvoice);
    app.get("/not_official/mockupPayment", mixins_mockupPayment);
    app.post("/not_official/pay", mixins_makePayments);

    app.use("*", async (req, res) => res.render("invalid_address"))
    
    server.listen(CONFIG.port, CONFIG.hostname, async () => {
        console.log(`Server Running in http://${CONFIG.hostname}:${CONFIG.port}`);
    });
})