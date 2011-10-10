**WARNING:  the current version of Chrome (14) broke a lot of technologies used by msgboy. We're working on fixing them. If you really want to play with msgboy, we suggest you try it out with [Chrome Canary](http://tools.google.com/dlpage/chromesxs). It does work like a charm in this future!**

# Msgboy

The msgboy is a *browser application* that pushes content from the web to the users. It observes the user's browsing habits (but respects their privacy!), and subscribes to the sites they seem to care about, using [Superfeedr](http://superfeedr.com). When these sites update, the content is sent to the user and a notification is shown to the user. 

The msgboy may not always show relevant messages, which is why *the user is asked to vote up or down on messages that he gets*. The msgboy learns from that and tries to only show relevant messages to the user.

The user can also see all the messages that he previously received using the dashboard. The size of the messages in the dashboard indicates their relevance.

You can get the msgboy from [http://msgboy.com](http://msgboy.com). However, we're still in an *early beta phase*, which means we try to limit the number of users to provide them with a personalized help should they have any issue. So, please, if you are using the msgboy, we kindly ask that you **report any issue**.

## Developers

The msgboy aims at using a lot of *open web protocols* and techniques to interact better with more online services and providing a universal notification service, without requiring them adapt to the msgboy. Of course, developers can _always_ decide to provide deeper integration with the msgboy.

The msgboy is open source. We use git for source versioning and [github to host it](https://github.com/superfeedr/msgboy). Please, fork it, and feel free to change anything that doesn't suit your needs. Also, tell us about the changes so that we can maybe make the msgboy better for everyone using it!

### Technology used

Browsers API (Chrome, Firefox and Safari to come), [IndexedDB](http://www.w3.org/TR/IndexedDB/), [Websockets](http://dev.w3.org/html5/websockets/), [PubSubHubbub](http://code.google.com/p/pubsubhubbub/), [XMPP](http://xmpp.org/), [StropheJS](http://strophe.im/), [Backbone.js](http://documentcloud.github.com/backbone/), [jQuery](http://jquery.com/), [Isotope](http://isotope.metafizzy.co/). If you're into 3 or more of these technologies, feel free to get in touch, *we're hiring*!

### Debugging and Inspecting

The msgboy is a [Chrome application](http://code.google.com/chrome/extensions/index.html). If you'd like to dive into the code, you need to [checkout the source code](https://github.com/superfeedr/msgboy). Then, open Chrome and go to <code>[chrome://extensions/](chrome://extensions/)</code> in a new tab. Click on <code>Developer Mode</code>. Now, hit the <code>Load Unpacked extension</code> button and select the msgboy source directory.
Clicking on <code>/views/html/background.html</code> will let you inspect the background HTML page for the msgboy which runs continuously.

If you submit bug reports, please provide as much content as possible (Chrome version, as well as the logs from the background page).


### Code standards
Code standards for the project are enforced with node-jshint. If you install the 'ignore' branch of this project: [https://github.com/jshint/node-jshint/tree/ignore](https://github.com/jshint/node-jshint/tree/ignore) then you can run `jshint .` at the root of the project and it will check all js files that are not in `.jshintignore` against the linting options specified in the `.jshintrc` file.

Note that you can't simply install it with `npm` you have to download the `ignore` branch specifically and then from the root of that project you can do:

    npm install . -g

After that, the `jshint` command should be available. 

### Plugins

When installing the msgboy, it will look at several existing services where the user may have already subscribed/followed/watched topics, users, or any kind of resource. The msgboy assumes that if a user has done that in the past, it means that he may care about this resource, so the msgboy will subscribe to that source. It is important that this source provide RSS/Atom feeds to allow for the subscription, obviously.

Similarly, when the user continues to use his favorite web services, he may subscribe/follow/watch additional resources. The msgboy then maps these new subscriptions and subscribes to the corresponding feeds.

All this is done with the help of the *plugins*. We have already implemented [several plugins](https://github.com/superfeedr/msgboy/tree/master/controllers/plugins) for some well known services. There is one for [Tumblr](https://github.com/superfeedr/msgboy/blob/master/controllers/plugins/tumblr.js), or [Google Reader](https://github.com/superfeedr/msgboy/blob/master/controllers/plugins/google-reader.js), but also for the [browser bookmarks](https://github.com/superfeedr/msgboy/blob/master/controllers/plugins/bookmarks.js), the [browser history](https://github.com/superfeedr/msgboy/blob/master/controllers/plugins/history.js)... etc.

We have also implemented a [generic](https://github.com/superfeedr/msgboy/blob/master/controllers/plugins/generic.js) bookmark that uses HTML5's data attributes to add a source to the msgboy when the user interacts with a page element. For example, if you have the msgboy installed and <a href="" class="msgboy-follow" data-msgboy-url="http://blog.msgboy.com/rss" >click on this link</a>, your msgboy will have a subscription for our blog.

The easiest way to integrate with the msgboy is to add the right HTML5 markup to your pages so that when one of your users does follows/subscribes/watches another resource, the msgboy can trigger a subscription on its own.

You may also create a full blown msgboy plugin, but we may not integrate it in the main release of the msgboy as we want to make sure we do not take too many resources from our user's computers.

### TODO

* Add per-site unread list (as top screen bars)
* <del>Add snooze</del>
* Add support for unsubscription in plugins.
* Add support for ActivityStreams
* When subscribing to a feed on a page, check for rel="me" links and suggest corresponding feeds if they apply.
* <del>Rewrite the msgboy.com page with inbox</del>.
* Use the delay@stamp for created_at of offline messages.
* Run continuous testing before running Rake tasks.
* <del>Run JSLint (and CSSLint?) in Rake tasks for cleaner JS.</del>
* Add support for webintents, as a subscribing app, and calls for "sharing" apps.
* Add the ability for a 3rd party site to ask for the list of subscriptions for a user who uses the msgboy. We want to use a system that would protect the users from having _all_ their subscriptions stolen. A solution would be to ask for subscriptions on a given domain, for example.
* HTML5 : Custom (web-based) protocol handlers
* Improve the relevance algorithm by adding the keywords based filtering (Bayes).
* Integrate with bit.ly
* Integrate with Chartbeat
* More plugins for websites that have some kind of subscription scheme.
* Keyboard navigation for the dashboard and notifications.
* Grouping of items in the dashboard (by source, and by topic).
* <del>Set git tags when bumping</del>
* <del>Throttle down importing of sources, to avoid slowness at setup. Since everything happens in the background. It's ok to take more time</del>.
* <del>Show messages when there was no subscription performed at all...</del>
* <del>Show more help in the msgboy dashboard in the form of boxes. These should indicate what needs to be done to subscribe to more content (bookmarking stuff!).</del>
* <del>Add some feeds in blacklists (like wikipedia's feeds).</del>
* Check safari bookmarks so that they're not taken into account...
* Improve dashboards by deleting content at the top when scrolling down. It does also mean that we need to load more when scrolling up. Thanks [Dodo](https://github.com/dodo) for the idea.
* Check Memory usage and fix it. Don't ask, it's _always_ too high.
* Add domain-based filtering for relevance.
* Remove the different colors for notifications. That's hard to interpret.
* Show screenshot for large boxes if there is no image at all.


## Publishers

Msgboy increases loyalty and engagement of your users and visitors. They can follow pages on your site so that when you add content, they're notified. 
Here are a few tips and tricks to make it easier for people to subscribe.

- Point to a feed that includes updates in each page of your site.
    * Put a single feed per page, corresponding to the content on that page.
    * Make sure you use a meaningful <code>title</code> in the <code>link</code> element. Do not include RSS, or Feed, but maybe just the title of the content. "Julien's Blog" is a good example. "RSS feed" is not, as it's not meaningful for users.
    
- Setup your feeds correctly.
    * Make sure your feed is correctly formatted, valid and easy to parse (limit to 10 entries, use unique identifiers for each entry, correctly formatted dates... etc)
    * Implement PubSubHubbub for realtime notifications (users are notified as soon as you update the content). [Superfeedr](http://superfeedr.com/publisher) hosts most of the hubs out there.

- Tricks
    * Listen to msgboy triggered events to keep track of your visitors who use msgboy, or who subscribe to your feeds. Listen to the events  <code>msgboy-subscribed</code> on the body.

