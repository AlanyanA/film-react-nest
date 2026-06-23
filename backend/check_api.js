const http = require('http');
http.get('http://localhost:3000/api/afisha/films', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', ()=> {
    console.log('STATUS', res.statusCode);
    console.log(data.slice(0,2000));
  });
}).on('error', e => { console.error(e); process.exit(1); });
