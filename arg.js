const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const parser = require('front-matter');
const util = require('util');
const ejs = require('ejs');


//const app = express.Router();
const showdown = require('showdown');
const converter = new showdown.Converter();

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

const encoding ='utf8';
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

async function read(file) {
    const data = await readFile(file);
    return data.toString(encoding);
}

app.get('/', async (req, res) => {
    var filelist = await readdir('./articles');
    const index = filelist.indexOf('img');
    filelist.splice(index,1);

    var sluglist = [];
    for(var i = 0; i < filelist.length; i++){
        const data = await read('./articles/' + filelist[i]);
        const frontmatter = parser(data);
        sluglist[i] = frontmatter.attributes.title;
    }
    res.render('/views/test.ejs', {articles: sluglist, title: 'Greinasafn'});
});

app.get('/articles/:slug', async (req, res) => {
    var filelist = await readdir('./articles');
    const index = filelist.indexOf('img');
    filelist.splice(index,1);

    var artList = [];
    for(var i = 0; i < filelist.length; i++){
        const data = await read('./articles/' + filelist[i]);
        const frontmatter = parser(data);
        artList[i] = frontmatter;
    }
    var teljari = 0;
    for(var i = 0; i < artList.length; i++){
        if(artList[i].attributes.slug === req.params.slug){
             teljari=i;
        }
    }
    res.send(artList[teljari].body);
});

module.exports = app;

var markdown = require( "markdown" ).markdown;