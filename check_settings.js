
import http from 'http';

http.get('http://localhost:8888/.netlify/functions/api/settings', (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
        data += chunk;
    });

    resp.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('Category Visibility (Raw):', json['category_visibility']);
            if (json['category_visibility'] && json['category_visibility'].value) {
                console.log('Parsed:', JSON.parse(json['category_visibility'].value));
            }
        } catch (e) { console.log(e); }
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});
