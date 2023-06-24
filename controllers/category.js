const Category = require('../models/category');
const Campground = require('../models/campgrounds');

module.exports.index = async (req, res) => {
  try {
    const categories = await Category.find({});
    const campgrounds = await Campground.find({});

    res.render('category/index', { categories, campgrounds });
  } catch (error) {
    console.error('Error retrieving categories:', error);
    res.render('error'); // Render an error page or handle the error appropriately
  }
};


module.exports.showCamp = async(req, res) => {
    const { id } = req.params
    const category = await Category.findById(id)
    const campgrounds = await Campground.find({category: {_id:id}})
    res.render('category/show.ejs', {campgrounds , category})
}
/*
const Category = require('../models/category');
const Campground = require('../models/campgrounds');

module.exports.index = async (req, res) => {
  try {
    const categories = await Category.find({});
    const campgrounds = await Campground.find({});

    res.render('category/index', { categories, campgrounds });
  } catch (error) {
    console.error('Error retrieving categories:', error);
    res.render('error'); // Render an error page or handle the error appropriately
  }
};

*/