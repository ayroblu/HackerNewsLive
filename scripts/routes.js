// PageJS
// -------
// Page js setup, includes basic caching
(function () {
  // private api
  var cache = {};
  var currentPage = {page:null,state:[]};
  var finishRoutes = {
    'nextPage-cuteness': function(){
      var popup = geid('nextpage-popup');
      popup.classList.add('hidden');
    }
  };
  // Call a url -> What resources do I need to load? -> Do I need to switch resources (based on url?) -> Replace resources in certain places. look at angular = Get all elements with attribute, for an entry point, onkeyup alters innerText of all elements with attribute
  // Run a blanket rule that no two items can have the same id, even if different pages.
  // 1. Keep track of currentPage
  // 2. What resources do I need for my new url
  // 3. If these resources have not been loaded, add them.
  // Example with sub resources like popups - two funcs, they run in order, 
  //    if (currentPage.state.length >= 1 && currentPage.state[0] == 'pagename') {
  //      // Do nothing
  //    } else {
  //      currentPage.state.splice(1);
  //      currentPage.state[0] = 'State';
  //      cachedGet(url, callback);
  //      // How do I cache?
  //      // - main page is cache['pagename'] = div
  //      var div = document.createElement('div');
  //      div.innerHTML = jsonData;
  //      var frag = document.createDocumentFragment();
  //      for (var i = 0; i < div.children.length; ++i) {
  //        frag.appendChild(div.children[i]);
  //      }
  //      cache['pagename'] = frag;
  //      main.innerHTML = cachedthing;
  //      main.appendChild(div);
  //    }
  //
  // Step 2: turn this in to a definitions file? Saves on repeating
  // - allow pulling via json
  
  function cachedGet(url, onSuccess, onError, lb, ignoreCurrentPage) {
    if (currentPage.page == url)
      return;
    var cacheSuccess = function(data) {
      if (!ignoreCurrentPage)
        currentPage.page = url;
      cache[url] = data;
      data = JSON.parse(data);
      onSuccess(data);
    }
    if (cache[url])
      return cacheSuccess(cache[url]);
    ajaxGet(url, cacheSuccess, onError, lb ? qget('.loadingbar') : null);
  }

  function pager(pageName, pageLevel, runPage, next){
    if (currentPage.state.length >= pageLevel+1 && currentPage.state[pageLevel] == pageName) {
      // Do nothing
      return next();
    }
    currentPage.state.splice(pageLevel+1);
    currentPage.state[pageLevel] = pageName;

    runPage(next);
  }
  function mainPager(pageName, content, setup, next){
    var main = geid('main');
    for (var i = 0; i < main.children.length; ++i) {
      main.children[i].style.display = "none";
    }

    if (cache[pageName]) {
      cache[pageName].style.display = "";
      return next();
    }

    ajaxGet('/views/'+pageName, function(responseText){
      var div = document.createElement('div');
      div.innerHTML = responseText;

      cache[pageName] = div;
      main.appendChild(div);
      if (typeof setup !== "function"){
        return next();
      }
      setup(next);
    });
  }

  function home(ctx, next) {
    //var url = '/api/getsegmentengagement/'+ctx.params.segment;
    //var onSuccess = function (data) {
    //  window.done.push(function(cb){
    //    createEngagementChart(data.data);
    //    cb();
    //  });
    //  datalib['engagementstatistics/segment'] = data.data;
    //  next();
    //}
    //cachedGet(url, onSuccess, null, true, true);
    var pageName = 'home';
    var func = function(next){
      var content = "<h1>Home</h1><div class='hidden' id='home-popup'>Popup</div>";
      mainPager(pageName, content, function(cb){
        addCardFlipperListener();
        cb();
      }, next);
    }
    pager(pageName, 0, func, next);
  }
  function subpage(ctx, next) {
    var pageName = 'home-subpage';
    var func = function(next){
      var popup = geid('home-popup');
      popup.classList.remove('hidden');
    }
    pager(pageName, 1, func, next);
  }
  function nextPage(ctx, next) {
    var pageName = 'nextPage';
    var func = function(next){
      var content = "<h1>Next Page</h1><div class='hidden' id='nextpage-popup'>cuteness</div>";
      mainPager(pageName, content, function(cb){cb()}, next);
    }
    pager(pageName, 0, func, next);
  }
  function cuteness(ctx, next) {
    var pageName = 'nextPage-cuteness';
    var func = function(next){
      var popup = geid('nextpage-popup');
      popup.classList.remove('hidden');
    }
    pager(pageName, 1, func, next);
  }

  // public api
  window.init = {
    ctx: function (ctx, next) {
      var state = currentPage.state[currentPage.state.length-1];
      if (state in finishRoutes) {
        finishRoutes[state]();
      }

      ctx.data = {};
      ctx.partials = {};
      next();
    }
  };

  window.route = {
    home: home
  , subpage: subpage
  , nextPage: nextPage
  , cuteness: cuteness
  };

  window.render = {
    content: function (ctx, next) {
      //content = template.render(ctx.data, ctx.partials);
        //var template = Hogan.compile(html),
        //  content = template.render(ctx.data, ctx.partials);
        //$('#content').empty().append(content);

      // Set content
      //var main = qget('#main');
      //if (ctx.partials.content)
      //  main.innerHTML = ctx.partials.content;
      //
      //// Add and run scripts
      //runScriptsInElement(main);

      //// hide the navigation
      //if (ctx.data.className)
      //  changeActiveUnDim(qget("#mainnav ."+ctx.data.className));
      //
      //// Call any final functions
      ////if (typeof done === 'function') done();
      //done.push(function(cb){done = []; cb()});
      //async.series(done);
    }
  };

  window.done = [];
}());

// Routes for pagejs
page('*', init.ctx);
page(/^\/(subpage)?$/, route.home);
page('/subpage', route.subpage);
page(/^\/nextPage\/?.*/, route.nextPage);
page('/nextPage/cuteness', route.cuteness);
page('*', render.content);
page();
