define(function (require) {
  var Base     = require('src/views/base'),
      Diary    = require('src/models/diary'),
      Category = require('src/models/category'),
      dust     = require('dust');

  var HomeView = Base.extend({
    el: "#wrapper",

    opts: {},

    initialize: function () {
      var self = this;

      // init models
      this.diary = new Diary();
      this.category = new Category();

      // init opts
      this.opts.page_num = 1;
      this.opts.first_render = true;

      this.render(self.opts);

    },

    scrollEnd: function (e) {
      e.preventDefault(); 
      var self = this;
      
      var window_height   = $(window).height();
      var scroll_top      = self.$el.find('#content').scrollTop();
      var document_height = self.$el.find('#blogList').height();

      if( scroll_top + window_height >= document_height - 20) {
        clearTimeout(self.timmer);
        self.timmer = setTimeout( function () {
          self.loadMore();
        }, 300);
      }
    },

    loadMore: function () {
      this.render(this.opts);
    },

    render: function (opts) {
      var self = this;

      // Get 10 Diaries From API, also Load Sidebar
      $.when(
        self.diary.fetchDiaryList(opts.page_num),
        self.category.fetchCategoryList()
      ).done( function (data, categories) {
        self.opts.page_num += 1;
        var response = {
          data: data,
          categories: categories
        };
        if( self.opts.first_render === true )
          self.firstRender(response);
        else
          self.moreRender(response);
      });

    },

    firstRender: function (resp) {
      var self = this;

      dust.render('tpl_home', resp, function (err, out) {
        self.$el.off().html(out);
        self.setElement('#wrapper');
        self.hideLoading();
        self.opts.first_render = false;

        // bind scroll function on content
        self.$el.find('#content').on('scroll', function (e) {
          self.scrollEnd(e);
        });

        // init base function
        self.init();
      });

    },

    moreRender: function (resp) {
      var self = this;
      dust.render('tpl_diary_list', resp, function (err, out) {
        self.$el.find('#blogList').append(out);

        // refresh base function
        self.refresh();
      });    
    }

  });

  return HomeView;
});