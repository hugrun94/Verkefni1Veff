const express = require('express');

const app = express();
const fs = require('fs');
const parser = require('front-matter');
const util = require('util');

const showdown = require('showdown');

const converter = new showdown.Converter();

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

const encoding = 'utf8';
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

async function read(file) {
  const data = await readFile(file);
  return data.toString(encoding);
}


app.get('/articles/:slug', async (req, res) => {
  const filelist = await readdir('./articles');
  const index = filelist.indexOf('img');
  filelist.splice(index, 1);
  console.info(filelist);

  for (let i = 0; i < filelist.length; i += 1) {
    const data = await read(`./articles/${filelist[i]}`);
    const frontmatter = parser(data);
    const fileslug = frontmatter.attributes.slug;
    if (req.params.slug === fileslug) {
      const html = converter.makeHtml(frontmatter.body);
      res.render('article', { html, title: frontmatter.attributes.title });
    }
  }
});

app.get('/', async (req, res) => {
  const filelist = await readdir('./articles');
  const index = filelist.indexOf('img');
  filelist.splice(index, 1);

  const sluglist = [];
  for (let i = 0; i < filelist.length; i += 1) {
    const data = await read(`./articles/${filelist[i]}`);
    const frontmatter = parser(data);

    const date = new Date(frontmatter.attributes.date);
    frontmatter.attributes.date = date.toDateString();


    sluglist[i] = frontmatter.attributes;
    sluglist.sort((a, b) =>
      new Date(b.date) - new Date(a.date));
  }
  res.render('frontpage.ejs', { articles: sluglist, title: 'Greinasafn' });
});


app.use('/articles/img', express.static('./articles/img/'));

app.use((req, res) => {
  res.render('villa', { title: 'Fannst ekki', error: 'Ónei, fannst ekki' });
});

app.use((error,req, res,next) => {
  res.render('villa', { title: 'Villa kom upp', error: ' ' });
});


module.exports = app;
