import http from 'http';
import fs from 'fs';
import url from 'url';
import os from 'os';

let ip;
const port = process.argv[2] || 28000;

const httpserver = http.createServer((req, res) => {
    const date = new Date();
    const reqUrlString = req.url;

    if(req.method === "GET"){
        
        const data = {ip: ip, porta: port, response: "200", desc: "Server ready!"};
        const stringed = JSON.stringify(data);
        fs.writeFile('./data/online.json', stringed, 'utf-8', error => {if(error)console.error(error)});
        
        const get = '[' + date.getFullYear() + '-' + 
        (date.getMonth() + 1) + '-' + date.getDate() + ' ' +  
        date.getHours() + ':'+ date.getMinutes() +  ':'+ date.getSeconds() + 
        '] New GET request from: ' + req.socket.remoteAddress;

        console.info(get);
        const urlObject = url.parse(reqUrlString, true, false);

        let fileName = urlObject.pathname;
        fileName = fileName.substr(1);

        fs.readFile(fileName, {encoding:'utf-8', flag: 'r'}, (error, data) => {
            if(error){
                res.setHeader('Content-type', 'text/html')
                res.writeHead(404, {'Access-Control-Allow-Origin':'*'});
                fs.readFile('.\\html\\index.html', {encoding:'utf-8', flag: 'r'}, (error, html) =>{
                    res.end(html);
                })
                
            }
            else{
                res.writeHead(200, 
                    {
                        'Access-Control-Allow-Origin':'*'
                    }
            );
                res.end(data);
            }
        });
    }
    else if(req.method === 'POST'){
        console.info('[' + date.getFullYear() +'-' + 
                    (date.getMonth() + 1) + '-' + date.getDate() + ' ' +  
                    date.getHours() + ':'+ date.getMinutes() +  ':'+ date.getSeconds() + 
                    '] New POST request from: ' + req.socket.remoteAddress);
        
        const pathName = url.parse(reqUrlString, true, false).pathname;
        if('/data' == pathName){
            let body = '';
        
            req.on('data', chunk => {
                body += chunk;
            });
     
            req.on('end', () => {
                const postData = JSON.parse(body);
    
                const jsonContent = JSON.stringify(postData);

                fs.writeFile('./data/mesa_' + postData.fileName + '.json', jsonContent, 'utf-8', error => {if(error)console.error(error)});
                
                res.writeHead(200, {'Access-Control-Allow-Origin':'*'});
                res.end("Ficheiro escrito com sucesso para: /data");
            })
        }
    }
})

const ipAdress = os.networkInterfaces();
Object.keys(ipAdress).forEach(ifName =>{
    let alias = 0;
    ipAdress[ifName].forEach(iface =>{
        if('IPv4' !== iface.family || iface.internal !== false)
            return;
        
        if(alias >= 1)
            console.log(ifName + ':' + alias, iface.address);
        else
           ip = iface.address;
        ++alias;
    })
})

httpserver.listen(port);
console.info("Http web server listening at " + ip + ':' + port + '.');