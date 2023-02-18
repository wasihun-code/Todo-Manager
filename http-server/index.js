const http = require('http')
const fs = require('fs')
const minimist = require('minimist')

let args = minimist(process.argv.slice(1), {
    default: {
        port: 3000
    }
})



let homeHtml = ''
let projectHtml = ''
let registrationHtml = ''

fs.readFile('home.html', (err, home) => {
    if (err) throw err;
    homeHtml = home
});
fs.readFile('project.html', (err, project) => {
    if (err) throw err;
    projectHtml = project;
});
fs.readFile('registration.html', (err, registration) => {
    if (err) throw err;
    registrationHtml = registration;
})

http.createServer((request, response) => {
    let url = request.url;
    response.writeHeader(200, {'ContentType': 'text/html'});
    switch (url) {
        case '/project':
            response.write(projectHtml)
            break;
        case '/registration':
            response.write(registrationHtml)
            break;
        default:
            response.write(homeHtml)
            break;            
    }
    response.end()
}).listen(args.port)
