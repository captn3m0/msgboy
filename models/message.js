var Message = Backbone.Model.extend({
  storeName: "messages",
  database: msgboyDatabase,

  defaults: {
    "title":        null,
    "atom_id":      null,
    "summary":      null,
    "content":      null,
    "links":        {},
    "read_at":      0,
    "starred_at":   0,
	"created_at": 	null
  },

  mark_as_read: function() {
    this.save({
		read_at: new Date().getTime()
	});
  },

  mark_as_starred: function() {
    this.save({
		starred_at: new Date().getTime()
	});
  },
  
});

// {
//     "id": "tag:typepad.com,2003:post-6a0133f4720546970b0147e303aff5970b",
//     "published": "2011-03-05T17:00:36+00:00",
//     "updated": "2011-03-05T17:00:36+00:00",
//     "title": "Justin Bieber's 'Never Say Never' Is Third-Highest-Grossing Documentary Of All Time",
//     "summary": "Insiders say film could get nominated in documentary category at next year's Oscars. By Gil Kaufman Justin Bieber in \"Justin Bieber: Never Say Never\" Photo: Paramount Pictures The kid is hot. First, Justin Bieber became the first person since, well, himself to land two albums in the top five on...",
//     "content": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p type=\"articleSubhead\">Insiders say film could get nominated in documentary category at next year's Oscars.<br/>By Gil Kaufman</p> <p> <a href=\"http://www.mtv.com/news/articles/1659185/justin-bieber-never-say-never-box-office.jhtml\"> <img type=\"photo\" src=\"http://www.mtv.com/shared/promoimages/movies/j/justin_bieber_never_say_never/bieber_red_hoodie/281x211.jpg\"/> </a> <br/> <i type=\"articlePhotoCaption\">Justin Bieber in \"Justin Bieber: Never Say Never\"</i> <br/> <i type=\"articlePhotoCredit\">Photo: Paramount Pictures</i> </p> <p type=\"articleText\">  <p> The kid is hot. First, Justin Bieber became the first person since, well, himself to land <a href=\"/news/articles/1659065/justin-bieber-billboard.jhtml\">two albums in the top five</a> on the <I>Billboard</I> 200, and now his 3-D movie, <a href=\"/news/articles/1657717/justin-bieber-never-say-never.jhtml\">\"N...www.mtv.com/news/articles/1659185/justin-bieber-never-say-never-box-office.jhtml</a></p><p><a href=\"http://www.metroidmetal.com/ridley/memberlist.php?mode=viewprofile&u=77674\">Bianca Kajlich</a> <a href=\"http://ehaontario.ca/memberlist.php?mode=viewprofile&u=427\">Bijou Phillips</a> <a href=\"http://forums.brigwyn.com/memberlist.php?mode=viewprofile&u=229\">Blake Lively</a> <a href=\"http://forum.artweaver.de/memberlist.php?mode=viewprofile&u=1890\">Blu Cantrell</a> </p></div>",
//     "links": {
//         "alternate": {
//             "text/html": [{
//                 "href": "http://annahoudeshell.typepad.com/blog/2011/03/justin-biebers-never-say-never-is-third-highest-grossing-documentary-of-all-time.html",
//                 "rel": "alternate",
//                 "title": "Justin Bieber's 'Never Say Never' Is Third-Highest-Grossing Documentary Of All Time",
//                 "type": "text/html"
//             }, {
//                 "href": "http://annahoudeshell.typepad.com/blog/",
//                 "rel": "alternate",
//                 "title": null,
//                 "type": "text/html"
//             }]
//         },
//         "replies": {
//             "text/html": [{
//                 "href": "http://annahoudeshell.typepad.com/blog/2011/03/justin-biebers-never-say-never-is-third-highest-grossing-documentary-of-all-time.html",
//                 "rel": "replies",
//                 "title": "Justin Bieber's 'Never Say Never' Is Third-Highest-Grossing Documentary Of All Time",
//                 "type": "text/html"
//             }]
//         },
//         "self": {
//             "application/atom+xml": [{
//                 "href": "http://annahoudeshell.typepad.com/blog/atom.xml",
//                 "rel": "self",
//                 "title": null,
//                 "type": "application/atom+xml"
//             }]
//         },
//         "hub": {
//             "text/html": [{
//                 "href": "http://hubbub.api.typepad.com/",
//                 "rel": "hub",
//                 "title": null,
//                 "type": "text/html"
//             }]
//         }
//     },
//     "source": {
//         "title": "Track feed for music"
//     }
// }