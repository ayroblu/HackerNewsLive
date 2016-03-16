CME Reporting Web Service
=========================

Version 2.0

TODO:
-----

Update some more loading pages, browser compatibility, back button things

Installation
------------

Generated with express-generator

Install dependencies with:

```
npm install
```

Run with 

```
DEBUG=temp:* npm start
```

This command actually calls node bin/start, which is the initialisation script (which is mostly empty right now)

### MongoDB:

This [MongoDB doc](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/) is important for installing.
On mac, it is installed through homebrew.

```
brew install mongodb
```

Make sure that the default data directory exists (could use another dir?) and ensure it has the right permissions

```
mkdir -p /data/db
```

Run the MongoDB daemon:

```
mongod
mongod --dbpath <path to data directory>
mongod --dbpath '/Users/blu/Google Drive/cme/webReporting/data/'
```

Auto Live deployment setup as per [this article](https://www.digitalocean.com/community/tutorials/how-to-set-up-automatic-deployment-with-git-with-a-vps)

About
-----

KeystoneJS does a basic job, but if I want to have in place editing, then I will need to take advantage of ids? or angularJS directives.
This means that I want key (cms-headerText), and value (something < asdf) which would be autoescaped meaning can use innerHTML, then if logged in as admin, make all cms-* content editable

### Page JS
* This is a client side page switching library, which is super cool for preserving headers and such
* The [link](http://visionmedia.github.io/page.js/) to the home page.

Adding a page
-------------
These are the steps that were necessary to add a single page

1. New subpage file in `views/*.jade`
2. Add function, routes and pager to `public/js/routes.js` (3 steps)
3. Add default route to `routes/index.js`
4. Add page renderer to `routes/views.js` for the subpage rendering
5. May want to add to `views/layout.jade` and `public/css/index.styl` for navigation and styling and `public/js/index.js` for javascript functions

Favicon Generator
-----------------
Favicon generated from CME logo at [this](http://realfavicongenerator.net/favicon?file_id=p19uq7ful41r9t1tv1143013bh6lk6#.VfF0stOqqko) website

TODO
----

* Build process
    * Make files
    * scss
    * haml
* Content Management System (CMS)
    * Respond CMS
    * KeystoneJS
* AngularJS front end
* Single Page Application (SPA)
* MongoDB backend then translate to Sql Server
    * Might need to have both because CMS is built on one?
* Make it bleeding edge chrome, then port backwards?
* Probably want to use stylus [auto-prefixer](https://github.com/jenius/autoprefixer-stylus)
* Here are a list of articles that seem useful:
    * [crontab](http://stackoverflow.com/questions/13385029/automatically-start-forever-node-on-system-restart)
    * [prod nodejs (ubuntu)](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-14-04)
    * [10 nodejs mistakes](https://www.airpair.com/node.js/posts/top-10-mistakes-node-developers-make)
    * [nodejs on server restart](https://strongloop.com/strongblog/comparison-tools-to-automate-restarting-node-js-server-after-code-changes-forever-nodemon-nodesupervisor-nodedev/)
    * [Full prod nodejs](http://blog.carbonfive.com/2014/06/02/node-js-in-production/)
    * [Capture ctrl-c killing](https://thomashunter.name/blog/gracefully-kill-node-js-app-from-ctrl-c/)
    * [iptables](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-basic-iptables-firewall-on-centos-6)
* Articles on infinite scrolling
    * [angular + bindable](http://dailyjs.com/2014/02/18/angularis-bindable/)
    * [A react way](http://stackoverflow.com/questions/20870448/reactjs-modeling-bi-directional-infinite-scrolling)
    * [jquery example](https://gist.github.com/rpheath/659157)
    * [waypoints](http://imakewebthings.com/waypoints/guides/getting-started/)
* Minification
    * [node-minify](https://github.com/srod/node-minify)
    * [UglifyJS](https://github.com/mishoo/UglifyJS)
    * [Fanciness in Piler](https://github.com/epeli/piler)
    * [Closure v YUI](http://blog.feedly.com/2009/11/06/google-closure-vs-yui-min/)
    * [Closure v Uglify](http://www.peterbe.com/plog/comparing-google-closure-with-uglifyjs)
* This is potential useful: [walk through directory](http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search)

### Heatmap
Heatmap code updates CME_I_Location with location data based on ip

```sql
SELECT TOP 1000 * FROM CME_I_Location
SELECT TOP 1000 * FROM CME_GeoLocation
SELECT TOP 1000 * FROM CME_GeoBlocks

WHILE 1 = 1
BEGIN
    INSERT INTO [dbo].[CME_I_Location] (CME_I_Location, IP_SRC, IP, LocID, DateFrom, Individual)
        SELECT TOP 1000 NEWID(), 'C' AS IP_SRC,e.ip, gb.LocID, dbo.UDTToNZTime(e.Event_DateTime) AS DateFrom, /* e.cme_ID, i.emailAddress, */ i.CME_I_CAR
        FROM [CME_NZRU].[dbo].[CME_GeoBlocks] gb
            --join CME_GeoLocation gl on gb.locid=gl.locid
            JOIN sendgrid_event e WITH (nolock) ON CONVERT(INT,
                  CONVERT(BINARY(1),CONVERT(TINYINT,PARSENAME(e.ip, 4)))
                + CONVERT(BINARY(1),CONVERT(TINYINT,PARSENAME(e.ip, 3)))
                + CONVERT(BINARY(1),CONVERT(TINYINT,PARSENAME(e.ip, 2)))
                + CONVERT(BINARY(1),CONVERT(TINYINT,PARSENAME(e.ip, 1)))
            ) BETWEEN startipnum AND endipnum
            JOIN CME_I_CAR i WITH (nolock) ON i.EmailAddress=e.email
        WHERE e.event = 'click'
            AND NOT EXISTS (SELECT 1 FROM CME_I_Location L WITH (nolock) WHERE L.LocID=gb.locId AND L.IP_SRC='C')
        IF @@ROWCOUNT<1000
            BREAK
END
```

Could use:

```
SELECT CONVERT(INT, CONVERT(BINARY(1),CONVERT(TINYINT,PARSENAME(e.ip, 4)))
    + CONVERT(BINARY(1),CONVERT(TINYINT,PARSENAME(e.ip, 3)))
    + CONVERT(BINARY(1),CONVERT(TINYINT,PARSENAME(e.ip, 2)))
    + CONVERT(BINARY(1),CONVERT(TINYINT,PARSENAME(e.ip, 1)))
) a, (
  CONVERT(bigint, PARSENAME(e.ip,1)) +
  CONVERT(bigint, PARSENAME(e.ip,2)) * 256 +
  CONVERT(bigint, PARSENAME(e.ip,3)) * 65536 +
  CONVERT(bigint, PARSENAME(e.ip,4)) * 16777216) b 
FROM (SELECT '121.99.231.205' ip) e
```

Imports
-------

* Charting library (highcharts?)
    * Google charts
* socket.io
* normalise.css
* html5shiv.js
* angular.js
* ckeditor.js (probably)
* respond cms
