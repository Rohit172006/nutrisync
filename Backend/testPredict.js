const http = require('http');

const data = JSON.stringify({
    hr_deviation: 1.1,
    sleep_hours: 7.5,
    activity_minutes: 45
});

const options = {
    hostname: '127.0.0.1',
    port: 6000,
    path: '/predict',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => console.log('Response:', body));
});

req.on('error', error => {
    console.error('Error:', error);
});

req.write(data);
req.end();
