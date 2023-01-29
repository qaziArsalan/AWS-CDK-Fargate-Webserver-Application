import { Express, NextFunction, Request, Response } from 'express';
import express from 'express';
import * as path from 'path';
import axios, { Axios, AxiosError } from 'axios';

const PORT = process.env.SERVER_PORT || 3000;
const apiBase = process.env.API_BASE;

// Express app,

const app: Express = express();
app.use(express.json())

const validator = async (req: Request, res: Response, next: NextFunction) => {

    const headers = req.headers;
    console.log(headers.host, headers.authorization, headers['content-type']);
    res.setHeader('Content-Type', 'application/json');
    next()
}

/* 
    Method: GET
    Route: apiBase/documents
*/
app.get('/', validator, async (req, res) => {
    try {
        const response = await askApi()
        console.log(response)
        return res.json({
            statusCode: 200,
            body: {
                name: 'WebServer',
                apiBase: apiBase,
                path: req.path
            },
        });
    } catch (error) {
        let response: { code: string, message: string };

        if (error instanceof AxiosError) {
            response = {
                code: error.code!,
                message: error.message!
            }
            return res.json(response);
        }
       
        return res.json({
            code: 'Errror',
            message: "Error occured"
        })

    }

});

app.listen(PORT, () => {
    {
        console.log('Server Started at: ' + PORT.toString());
        console.log('API Base: ' + apiBase);
    }
})

const askApi = async (): Promise<string> => {

    const { data: results } = await axios.get(`${apiBase}documents`)
    console.log(results);
    return "Server Returend Data";
}

