import http from "http";
import express, { Request, Response, NextFunction } from "express";
import getConfiguration from "./config";
import { mixins_checkInvoice, mixins_createInvoice } from "./create_invoice";

function requireAuth(_expectedAPIKEY: string, _expectedMID: number) {
    async function __auth(req: Request, res: Response, next: NextFunction) {
        const _do = req.query.do as string | null | undefined;
        const _apikey = req.query.apikey as string | null | undefined;
        const _mID = req.query.mID as number | null | undefined;
    
        const __fieldcheck = [ _do, _apikey, _mID ];
        if(__fieldcheck.includes(null) || __fieldcheck.includes(undefined) || __fieldcheck.includes("") || __fieldcheck.includes(" ") || __fieldcheck.includes(0) || __fieldcheck.includes("0")) return void res.status(400).json({
            status: "failed",
            data: {
                qris_status: "mandatory parameter is not valid"
            }
        });   
    
        if(_do as string != "create-invoice") return void res.status(400).json({
            status: "failed",
            data: {
                qris_status: "what we do for you?"
            }
        });

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

getConfiguration()
.then(async CONFIG => {
    const app = express();
    const server = http.createServer(app);
    
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(express.static( "public" ));
    app.set("view engine", "ejs");
    
    app.get("/restapi/qris/show_qris.php", requireAuth(CONFIG.apiKey, parseInt(CONFIG.mID.toString())), mixins_createInvoice);
    app.get("/restapi/qris/checkpaid_qris.php", requireAuth(CONFIG.apiKey, parseInt(CONFIG.mID.toString())), mixins_checkInvoice);
    app.get("/mp", async (req, res) => {
        res.render("payment", { amount: Math.ceil((Math.random() * 950_000) + 50_000) })
    })
    app.post("/pay", async (req, res) => {
        console.log(req.body)
    });
    
    server.listen(CONFIG.port, CONFIG.hostname, async () => {
        console.log(`Server Running in http://${CONFIG.hostname}:${CONFIG.port}`);
    });
})