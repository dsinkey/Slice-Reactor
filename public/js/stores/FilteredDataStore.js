var AppDispatcher = require('../dispatcher/Dispatcher');
var Constants = require('../constants/Constants');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var dateFilterHelpers = require('../utils/dateFilterHelpers');

var ActionTypes = Constants.ActionTypes;
var CHANGE_EVENT = 'change';

// DATA STORES
var _allChartData = [];
var _allCategoryData = [];
var _allMerchantData = [];

// Data store that is passed to all other stores
var _filteredChartData = {};
_filteredChartData.category = [];
_filteredChartData.merchant = [];

// default filter values
var _filterValues = {
  primary: 'Category',
  secondary: 'Merchant',
  category: 'active',
  merchant: '',
  minDate: '9999-12-30',
  maxDate: dateFilterHelpers.getToday().string,
  setMinDate: '',
  setMaxDate: dateFilterHelpers.getToday().string
};

// add all data to data stores
function _addFilteredData(chartData) {
  _allChartData = chartData;
  _allCategoryData = _filterByCategory(chartData); // min date defined here
  _allMerchantData = _filterByMerchant(chartData);
  _filterByDate(_filterValues);
};

//
function _filterByCategory(chartData) {
  return categories = chartData.map(function(item) {
    // finds min date
    if (new Date(item.purchaseDate) < new Date(_filterValues.minDate)) {
      _filterValues.minDate = item.purchaseDate;
      _filterValues.setMinDate = item.purchaseDate;
    }
    var categoryObj = {
      primaryLabel: item.categoryName,
      secondaryLabel: item.Order.Merchant.name,
      price: item.price / 100,
      date: item.purchaseDate
    };
    return categoryObj;
  });
};

//
function _filterByMerchant(chartData) {
  return merchants = chartData.map(function(item) {
    var merchantObj = {
      primaryLabel: item.Order.Merchant.name,
      secondaryLabel: item.categoryName,
      price: item.price / 100,
      date: item.purchaseDate
    };
    return merchantObj;
  });
};

// sets the user-submitted dates to the filterValue object
function _setDateRange(dates) {
  _filterValues.minDate = dates.minDate;
  _filterValues.maxDate = dates.maxDate;
};

//
function _filterByDate(dates) {
  _filteredChartData.category = _allCategoryData.filter(function(item) {
    return new Date(dates.minDate) <= new Date(item.date) && new Date(item.date) <= new Date(dates.maxDate);
  });
  _filteredChartData.merchant = _allMerchantData.filter(function(item) {
    return new Date(dates.minDate) <= new Date(item.date) && new Date(item.date) <= new Date(dates.maxDate);
  });
};

//
function _toggleFilter(categoryOrMerchant) {
  if (categoryOrMerchant === 'merchant') {
    _filterValues.primary = 'Merchant',
    _filterValues.secondary = 'Categories',
    _filterValues.category = '',
    _filterValues.merchant = 'active'
  } else {
    _filterValues.primary = 'Category',
    _filterValues.secondary = 'Merchants',
    _filterValues.category = 'active',
    _filterValues.merchant = ''
  }
};

var FilteredDataStore = assign({}, EventEmitter.prototype, {

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },
  getFilterValue: function() {
    return _filterValues;
  },
  getData: function() {
    if (_filterValues.primary === 'Category')
      return _filteredChartData.category;
    else
      return _filteredChartData.merchant;
  }
});

FilteredDataStore.dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;

  switch(action.type) {

    case ActionTypes.RECEIVE_CHART_DATA:
      _addFilteredData(action.allChartData);
      FilteredDataStore.emitChange();
      break;

    case ActionTypes.FILTER_DATA:
      _toggleFilter(action.filter);
      FilteredDataStore.emitChange()
      break;

    case ActionTypes.FILTER_BY_DATE:
      _setDateRange(action.dates);
      _filterByDate(_filterValues);
      break;

    default:
      // do nothing
  }
});

module.exports = FilteredDataStore;
