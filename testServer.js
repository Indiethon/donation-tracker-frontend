const path = require('path');
const fs = require('fs');
const express = require('express');

const app = express();

const paths = ['/', '/gallery']

// app.use('/pages', express.static(path.join(__dirname, '/pages')))
// app.use('/articles', express.static(path.join(__dirname, '/articles')))

fs.watch(__dirname, { recursive: true }, function (event, file) { staticFiles() })

staticFiles()

app.get("/", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, '/index.html'))
})

app.get('*', function (req, res) {
    res.status(404).sendFile(path.join(__dirname, '/404.html'))
});

app.listen(8080, (() => {
    console.log('Server listening at port 8080!')
}))

function staticFiles() {
    app.use('/', express.static(__dirname))
}