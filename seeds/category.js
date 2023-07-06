if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}


const mongoose = require('mongoose');
const db = mongoose.connection;
const Category = require('../models/category')
const dbUrl = process.env.DB_URL
mongoose.connect(dbUrl);
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log('Database Connected');
});

const categories = [
    {
        title: 'Men',
        
        
    },
    {
        title: 'Women',
       
    },
    {
        title: 'Children',
        
    },
    {
        title: 'Animals',
       
    }
    
]

const insert = async () => {
    const category = new Category({
        title: 'Men',
        image:{
            url:"https://unsplash.com/photos/aD5axmPDbdE"
        },
        description :
            "hello world"
        
       
    })
    await category.save()
    const category2 = new Category({
        title: 'Women',
        image:{
            url:"https://unsplash.com/photos/aD5axmPDbdE"
        },
        description :
            "hello world"
        
       
    })
    await category2.save()
    const category3 = new Category({
        title: 'Children',
        image:{
            url:"https://unsplash.com/photos/aD5axmPDbdE"
        },
        description :
            "hello world"
    
    })
    await category3.save()
    const category4 = new Category({
        title: 'Animals',
        image:{
            url:"https://unsplash.com/photos/aD5axmPDbdE"
        },
        description :
            "hello world"
        
    })
    await category4.save()
    console.log(categories);
}


insert();