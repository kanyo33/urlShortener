const express = require('express');
const app = express()

const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const shortUrl = require('./models/shortUrl')


app.use(bodyParser.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI || `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-5fecv.mongodb.net/test?retryWrites=true&w=majority`, {useNewUrlParser: true});

app.use(express.static(__dirname +'/public'));

app.get('/new/:urlShorten(*)', (req, res, next) => {
    const {urlShorten} = req.params;
    const regex = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;

    if(regex.test(urlShorten)===true){
        let short = Math.floor(Math.random()*100000).toString();

        const data = new shortUrl({
            originalUrl: urlShorten,
            shorterUrl: short
        });

        data.save(err => {
            if(err){
                return res.send('Error saving to database')
            }
        })
        return res.json(data);
    } else {
        return res.send('Invalid URL')
    }
});

app.get('/:urlForward', (req,res,next) => {
    const { shorterUrl } = req.params.urlForward;
    
    shortUrl.findOne({'shorterUrl': shorterUrl}, (err, data) => {
        if(err) return res.send('Error reading database');
        const re = new RegExp("^(http|https)://");
        const strToCheck = data.originalUrl;
        if(re.test(strToCheck)){
            res.redirect(301, data.originalUrl)
        } else {
            res.redirect(301, 'http://' + data.originalUrl)
        }
    })
})


app.listen(process.env.PORT || 3000, () => {
    console.log('Listening to Port 3000')
});

