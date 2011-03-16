// This function extract the feeds from the document.
function extractFeedLinks(callback) {
  links = []
  if(isFeedDocument()) { 
    // If we're on a feed document
    links.push({"href": window.location.href, "title": window.location.href})
    callback(links);
  }
  else {
    // If we're on a regular page
    links = discoverFeedsFromLinks();
    callback(links);
  }
}

// Let's now check well known apps to see if we can copy subscriptions.
// Google Reader. What else?
// if(window.location.host == "www.google.com" && window.location.pathname == '/reader/view/') {
//   chrome.extension.sendRequest({localstorage: "sync_googlereader"}, function(sync_googlereader) {
//     chrome.extension.sendRequest({localstorage: "sync_googlereader_last"}, function(sync_googlereader_last) {
//        if(sync_googlereader.value == "true" && (parseInt(new Date().getTime()) - parseInt(sync_googlereader_last.value || 0)) >  1000*3600*24) {
//           var request = new XMLHttpRequest();
//           request.open("GET", "http://www.google.com/reader/subscriptions/export", true);
//           request.onreadystatechange = function() {
            // if (request.readyState == 4) {
            //   $(request.responseXML).find("outline").each(function() {
            //     chrome.extension.sendRequest({msg: "subscribe", feed: {"href": $(this).attr("xmlUrl"), "title": $(this).attr("title")}});
            //   });
            // }
//             chrome.extension.sendRequest({localstorage: "sync_googlereader_last", set: new Date().getTime()}, function(response) {
//               // Do nothing.
//             })
//           }
//           request.send();
//         }
//     });
//   });
// }

/* Shamelessly stolen from the Official RSS Chrome extension */
function discoverFeedsFromLinks() {
  var results = document.evaluate('//*[local-name()="link"][contains(@rel, "alternate")] [contains(@type, "rss") or contains(@type, "atom") or contains(@type, "rdf")]', document, null, 0, null);

  var feeds = [];
  var item;

  while (item = results.iterateNext()) {
    feeds.push({"href": item.href, "title": item.title, "type": item.type});
  }
  order = {
    "application/atom+xml": 1,
    "application/rss+xml": 2,
    "application/rdf+xml": 3
  }
  feeds = feeds.sort(function(a,b) {
    return (order[a.type] || 4) - (order[b.type] || 4)
  });
  return feeds
}

/* Shamelessly stolen from the Official RSS Chrome extension */
function isFeedDocument() {
  var body = document.body;

  var soleTagInBody = "";
  if (body && body.childElementCount == 1 || body.childElementCount == 2 && body.children[1].id == "superfeedr-bookmark") {
    soleTagInBody = body.children[0].tagName;
  }

  // Some feeds show up as feed tags within the BODY tag, for example some
  // ComputerWorld feeds. We cannot check for this at document_start since
  // the body tag hasn't been defined at that time (contains only HTML element
  // with no children).
  if (soleTagInBody == "RSS" || soleTagInBody == "FEED" ||
      soleTagInBody == "RDF") {
    return true;
  }

  // Chrome renders some content types like application/rss+xml and
  // application/atom+xml as text/plain, resulting in a body tag with one
  // PRE child containing the XML. So, we attempt to parse it as XML and look
  // for RSS tags within.
  if (soleTagInBody == "PRE") {
    var domParser = new DOMParser();
    var doc = domParser.parseFromString(body.textContent, "text/xml");

    // |doc| now contains the parsed document within the PRE tag.
    if (containsFeed(doc)) {
      return true;
    }
  }

  return false;
}


/* Shamelessly stolen from the Official RSS Chrome extension */
function containsFeed(doc) {

  // Find all the RSS link elements.
  var result = doc.evaluate('//*[local-name()="rss" or local-name()="feed" or local-name()="RDF"]',doc, null, 0, null);

  if (!result) {
    return false;  // This is probably overly defensive, but whatever.
  }

  var node = result.iterateNext();

  if (!node) {
    return false;  // No RSS tags were found.
  }

  // The feed for arab dash jokes dot net, for example, contains
  // a feed that is a child of the body tag so we continue only if the
  // node contains no parent or if the parent is the body tag.
  if (node.parentElement && node.parentElement.tagName != "BODY") {
    return false;
  }

  return true;
}
