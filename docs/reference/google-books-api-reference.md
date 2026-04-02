# Overview

The APIs in the Google Books API Family let you bring [Google Books](https://books.google.com/) features to your site or application.

The new [Google Books API](https://developers.google.com/books/docs/overview#books_api_v1) lets you perform programmatically most of the operations that you can do interactively on the
Google Books website. The [Embedded Viewer API](https://developers.google.com/books/docs/overview#embedded_viewer_api) lets you embed the content directly into your site.

At Google, we're constantly striving to make information available to as
many people as possible, and our APIs were designed with that goal in mind.
However, we license much of the data that we use to power Google Books, so
it's not ours to distribute however we choose.

The API is not intended to be used as a replacement for commercial services.
These services are valuable and Google also relies upon them to build our
own APIs for the general public.

The Google Terms of Service for use of the APIs is available at [https://developer.google.com/books/terms.html](https://developers.google.com/books/terms). We will suspend a user's access to the APIs if a user violates the Terms of Service and does not take action to remedy the violation after notice of violation by Google.

## Books API v1 (Experimental)

The new Google Books API v1 gives you programmatic access to many of the operations available on Google Books website. You can use it to
create powerful applications that provide deeper integration with Google Books. Some of the main features that the API provides are:

- search and browse through the list of books that match a given query.
- view information about a book, including metadata, availability and price, links to the preview page.
- manage your own bookshelves.

A good first step in learning about the API is the [Getting Started](https://developers.google.com/books/docs/v1/getting_started) page. It explains the basic
concepts that the API uses and describes the basic interaction principles that the API follows. A comprehensive description of all the operations
supported by the API is given in the [Using the API](https://developers.google.com/books/docs/v1/using) page.

## Embedded Viewer API

|---|---|
| The Embedded Viewer API lets you embed book content from Google Books directly in your web pages with JavaScript. It allows you to build your own user experience around book previews. Adding book preview functionality to your site is relatively simple, though it does require some knowledge of HTML and JavaScript. The [Developer's Guide](https://developers.google.com/books/docs/viewer/developers_guide) explains how the API can be loaded using the Google AJAX loader and drawn into a particular container on your page. Once the embedded viewer has been added to a webpage, it can be controlled using [JavaScript functions](https://developers.google.com/books/docs/viewer/reference). This allows you to perform actions similar to what the user can do by clicking on the controls: you can go to the next page, zoom in or out, highlight search terms, and so on. You are also able to get the current page number, allowing your code react as the user navigates through the book. | [![](https://developers.google.com/static/books/images/embedded_viewer.png)](https://developers.google.com/books/docs/viewer/examples/book-simple) |

# Getting Started

This document details the background knowledge that you need in order to use
the Google Books API.
1. [Introduction](https://developers.google.com/books/docs/v1/getting_started#intro)
2. [Before you start](https://developers.google.com/books/docs/v1/getting_started#before_starting)
   1. [Get a Google account](https://developers.google.com/books/docs/v1/getting_started#getaccount)
   2. [Get familiar with Books](https://developers.google.com/books/docs/v1/getting_started#familiarize)
   3. [Learn about authorizing requests and identifying your application](https://developers.google.com/books/docs/v1/getting_started#auth)
3. [Books API background](https://developers.google.com/books/docs/v1/getting_started#background)
   1. [Books concepts](https://developers.google.com/books/docs/v1/getting_started#background-concepts)
   2. [Books API data model](https://developers.google.com/books/docs/v1/getting_started#background-resources)
   3. [Books API operations](https://developers.google.com/books/docs/v1/getting_started#background-operations)
4. [Calling style](https://developers.google.com/books/docs/v1/getting_started#invoking)
   1. [REST](https://developers.google.com/books/docs/v1/getting_started#REST)
5. [Data format](https://developers.google.com/books/docs/v1/getting_started#workingWithData)
   1. [JSON](https://developers.google.com/books/docs/v1/getting_started#data-json)

## Introduction

This document is intended for developers who want to write applications that
can interact with the Google Books API. [Google Books](https://books.google.com/)
has a vision to digitize the world's books. You can use the Google Books API to
search content, organize an authenticated user's personal library and modify it
as well.

## Before you start

### Get a Google account

You need a [Google account](https://www.google.com/accounts/NewAccount)
for testing purposes. If you already have a test account, then you're all set;
you can visit the [Google Books](https://books.google.com/) user
interface to set up, edit, or view your test data.

### Get familiar with Books

If you're unfamiliar with Google Books concepts, you should read this
document and experiment with the [user interface](https://books.google.com/)
before starting to code. This document assumes that you're familiar with web
programming concepts and web data formats.

### Learn about authorizing requests and identifying your application

When your application requests private data, the request must be authorized by an authenticated user who has access to that data.

In particular, all operations under "My Library" in the Google Books API are considered to be private and require authentication and authorization. In addition, any operation that modifies Google Books data can be performed only by the user who owns that data.

When your application requests public data, the request doesn't need to authorized, but does need to be accompanied by an identifier, such as an API key.

For information about how to authorize requests and use API keys, see [Authorizing requests and identifying your application](https://developers.google.com/books/docs/v1/using#auth) in the Using the API document.

## Books API background

### Books concepts

Google Books is built upon four basic concepts:

- **Volume**: A volume represents the data that Google Books hosts about a book or magazine. It is the primary resource in the Books API. All other resources in this API either contain or annotate a volume.
- **Bookshelf** : A bookshelf is a collection of volumes. Google Books provides a set of predefined bookshelves for each user, some of which are completely managed by the user, some of which are automatically filled in based on user's activity, and some of which are mixed. Users can create, modify or delete other bookshelves, which are always filled with volumes manually. Bookshelves can be made private or public by the user.

  **Note:** Creating and deleting bookshelves as
  well as modifying privacy settings on bookshelves can currently only be done
  through the [Google Books](https://books.google.com/) site.
- **Review**: A review of a volume is a combination of a star rating and/or text. A user can submit one review per volume. Reviews are also available from outside sources and are attributed appropriately.
- **Reading Position**: A reading position indicates the last read position in a volume for a user. A user can only have one reading position per volume. If the user has not opened that volume before, then the reading position does not exist. The reading position can store detailed position information down to the resolution of a word. This information is always private to the user.

### Books API data model

A resource is an individual data entity with a unique identifier. The Books
API operates on two types of resources, based on the concepts described
above:

- **Volume resource**: Represents a volume.
- **Bookshelf resource**: Represents a single bookshelf for a particular user.

The Books API data model is based on groups of resources, called collections:

Volume collection
:   The volume collection, is a collection
    of every volume resource managed by Google Books.
    As such, you cannot list all volume resources,
    but you can list all volumes that match a set of
    search terms.  

Bookshelf collection
:   A bookshelf collection consists of all
    the bookshelf resources managed by Google Books.
    Bookshelves must always be referenced in the context of a specific user's library.
    Bookshelves can contain zero or more volumes.

### Books API operations

You can invoke five different methods on collections and resources in the
Books API, as described in the following table.

| Operation | Description | REST HTTP mappings |
|---|---|---|
| list | Lists a specified subset of resources within a collection. | `GET` on a collection URI. |
| insert | Inserts a new resource into a collection (creating a new resource). | `POST` on a collection URI, where you pass in data for a new resource. |
| get | Gets a specific resource. | `GET` on resource URI. |
| update | Updates a specific resource. | `PUT` on resource URI, where you pass in data for the updated resource. |
| delete | Deletes a specific resource. | `DELETE` on resource URI, where you pass in data for the resource to be deleted. |

The operations that are supported for the various types of resources are
summarized in the table below. Operations that apply to a user's private data are
called "My Library" operations, and they all require [authentication](https://developers.google.com/books/docs/v1/using#auth).

| Resource Type | Supported Operations |||||
|   | **list** | **insert** | **get** | **update** | **delete** |
| **Volumes** | yes\* |   | yes |   |   |
| **Bookshelves** | yes\* | yes, AUTHENTICATED | yes\* | yes, AUTHENTICATED | yes, AUTHENTICATED |
| **Reading Positions** |   | yes, AUTHENTICATED | yes, AUTHENTICATED | yes, AUTHENTICATED | yes, AUTHENTICATED |
|---|---|---|---|---|---|

\*Both AUTHENTICATED and
unauthenticated versions of these operations are available, where the
authenticated requests operate on the user's private "My Library" data, and
unauthenticated requests operate on public data only.

## Calling styles

There are several ways to invoke the API:

- Using [REST](https://developers.google.com/books/docs/v1/getting_started#REST) directly
- Using REST from [JavaScript](https://developers.google.com/books/docs/v1/getting_started#JSONP) (no server-side code required)

### REST

REST is a style of software architecture that provides a convenient and consistent approach to requesting and modifying data.

The term REST is short for "[Representational State Transfer](https://en.wikipedia.org/wiki/Representational_state_transfer)." In the context of Google APIs, it refers to using HTTP verbs to retrieve and modify representations of data stored by Google.

In a RESTful system, resources are stored in a data store; a client sends a request that the server perform a particular action (such as creating, retrieving, updating, or deleting a resource), and the server performs the action and sends a response, often in the form of a representation of the specified resource.

In Google's RESTful APIs, the client specifies an action using an HTTP verb such as `POST`, `GET`, `PUT`, or `DELETE`. It specifies a resource by a globally-unique URI of the following form:

```
https://www.googleapis.com/apiName/apiVersion/resourcePath?parameters
```

Because all API resources have unique HTTP-accessible URIs, REST enables data caching and is optimized to work with the web's distributed infrastructure.

You may find the [method definitions](https://tools.ietf.org/html/rfc7231#section-4.3) in the HTTP 1.1 standards documentation useful; they include specifications for `GET`, `POST`, `PUT`, and `DELETE`.

#### REST in the Books API

The supported Books operations map directly to REST HTTP verbs, as described
in [Books API operations](https://developers.google.com/books/docs/v1/getting_started#background-operations).

The specific format for Books API URIs are:

```
https://www.googleapis.com/books/v1/{collectionName}/resourceID?parameters
```

where `resourceID` is the identifier for a volume
or bookshelf resource, and `*parameters*` are
any parameters to apply to the query. See [Query parameter reference](https://developers.google.com/books/docs/v1/using#query-params) for details.

The format of the `resourceID` path extensions lets you identify the resource you're currently operating on, for example:

```
https://www.googleapis.com/books/v1/volumes
https://www.googleapis.com/books/v1/volumes/volumeId
https://www.googleapis.com/books/v1/mylibrary/bookshelves
https://www.googleapis.com/books/v1/mylibrary/bookshelves/shelf
https://www.googleapis.com/books/v1/mylibrary/bookshelves/shelf/volumes
...
```

Note that operations with `mylibrary` in the URI apply only to the
currently authenticated user's private library data. The full set of URIs used
for each supported operation in the API is summarized in the [Books API Reference](https://developers.google.com/books/docs/v1/reference) document.

Here are a couple of examples of how this works in the Books API.

Perform a search for quilting:

```
GET https://www.googleapis.com/books/v1/volumes?q=quilting
```

Get information on volume s1gVAAAAYAAJ:

```
GET https://www.googleapis.com/books/v1/volumes/s1gVAAAAYAAJ
```

#### REST from JavaScript

You can invoke the Books API using REST from JavaScript (also called [JSON-P](https://en.wikipedia.org/wiki/JSONP)), using the `callback` query parameter and a callback function. This allows you to write rich applications that display Books data without writing any server side code.

**Note:** You can call authenticated methods by passing an OAuth 2.0 token using the [`access_token`](https://developers.google.com/books/docs/v1/using#query-params) parameter. To obtain an OAuth 2.0 token for use with JavaScript, follow the instructions described in [OAuth 2.0 for client-side web applications](https://developers.google.com/accounts/docs/OAuth2#clientside). In the "API Access" tab of the [APIs Console](https://code.google.com/apis/console), be sure set up a Client ID for web applications, and to use those OAuth 2.0 credentials when getting your token.

The following example uses this approach to display search results for "harry potter":

```
<html>
  <head>
    <title>Books API Example</title>
  </head>
  <body>
    <div id="content"></div>
    <script>
      function handleResponse(response) {
      for (var i = 0; i < response.items.length; i++) {
        var item = response.items[i];
        // in production code, item.text should have the HTML entities escaped.
        document.getElementById("content").innerHTML += "<br>" + item.volumeInfo.title;
      }
    }
    </script>
    <script src="https://www.googleapis.com/books/v1/volumes?q=harry+potter&callback=handleResponse"></script>
  </body>
</html>
```

## Data format

### JSON


[JSON](http://en.wikipedia.org/wiki/JSON) (JavaScript Object Notation) is a common, language-independent data format that provides a simple text representation of arbitrary data structures. For more information, see [json.org](http://www.json.org/).

<br />

# Using the API

## Contents

1. [Introduction](https://developers.google.com/books/docs/v1/using#intro)
   1. [Authentication and authorization](https://developers.google.com/books/docs/v1/using#auth)
   2. [Google Books IDs](https://developers.google.com/books/docs/v1/using#ids)
   3. [Setting User Location](https://developers.google.com/books/docs/v1/using#UserLocation)
2. [Working with volumes](https://developers.google.com/books/docs/v1/using#WorkingVolumes)
   1. [Performing a search](https://developers.google.com/books/docs/v1/using#PerformingSearch)
   2. [Retrieving a specific volume](https://developers.google.com/books/docs/v1/using#RetrievingVolume)
3. [Working with bookshelves](https://developers.google.com/books/docs/v1/using#WorkingBookshelves)
   1. [Retrieving a list of a user's public bookshelves](https://developers.google.com/books/docs/v1/using#RetrievingBookshelves)
   2. [Retrieving a specific public bookshelf](https://developers.google.com/books/docs/v1/using#RetrievingBookshelf)
   3. [Retrieving a list of volumes on a public bookshelf](https://developers.google.com/books/docs/v1/using#RetrievingBookshelfVolumes)
4. [Working with bookshelves in "My Library"](https://developers.google.com/books/docs/v1/using#WorkingMyBookshelves)
   1. [Retrieving a list of my bookshelves](https://developers.google.com/books/docs/v1/using#RetrievingMyBookshelves)
   2. [Retrieving a list of volumes on my bookshelf](https://developers.google.com/books/docs/v1/using#RetrievingMyBookshelfVolumes)
   3. [Adding a volume to my bookshelf](https://developers.google.com/books/docs/v1/using#AddVolumetoBookshelf)
   4. [Removing a volume from my bookshelf](https://developers.google.com/books/docs/v1/using#RemoveVolumefromBookshelf)
   5. [Clearing all volumes from my bookshelf](https://developers.google.com/books/docs/v1/using#ClearingBookshelf)
5. [Query parameter reference](https://developers.google.com/books/docs/v1/using#query-params)
   1. [Standard query parameters](https://developers.google.com/books/docs/v1/using#st_params)
   2. [API-specific query parameters](https://developers.google.com/books/docs/v1/using#api_params)

## Introduction

This document is intended for developers who want to write applications that
can interact with the Books API.
[Google Books](https://books.google.com) has a mission to digitize the
world's book content and make it more discoverable on the Web. The Books API is
a way to search and access that content, as well as to create and view
personalization around that content.

If you're unfamiliar with Google Books concepts, you should read
[Getting Started](https://developers.google.com/books/docs/v1/getting_started) before starting to code.

### Authorizing requests and identifying your application

Every request your application sends to the Books API needs to identify your application to Google. There are two ways to identify your application: using an [OAuth 2.0 token](https://developers.google.com/books/docs/v1/using#AboutAuthorization) (which also authorizes the request) and/or using the application's [API key](https://developers.google.com/books/docs/v1/using#APIKey). Here's how to determine which of those options to use:

- If the request requires authorization (such as a request for an individual's private data), then the application must provide an OAuth 2.0 token with the request. The application may also provide the API key, but it doesn't have to.
- If the request doesn't require authorization (such as a request for public data), then the application must provide either the API key or an OAuth 2.0 token, or both---whatever option is most convenient for you.

#### About authorization protocols

Your application must use [OAuth 2.0](https://developers.google.com/identity/protocols/OAuth2) to authorize requests. No other authorization protocols are supported. If your application uses [Sign In With Google](https://developers.google.com/identity/gsi/web), some aspects of authorization are handled for you.

#### Authorizing requests with OAuth 2.0

Requests to the Books API for non-public user data must be authorized by an authenticated user.

The details of the authorization process, or "flow," for OAuth 2.0 vary somewhat depending on what kind of application you're writing. The following general process applies to all application types:

1. When you create your application, you register it using the [Google API Console](https://console.cloud.google.com/). Google then provides information you'll need later, such as a client ID and a client secret.
2. Activate the Books API in the Google API Console. (If the API isn't listed in the API Console, then skip this step.)
3. When your application needs access to user data, it asks Google for a particular **scope** of access.
4. Google displays a **consent screen** to the user, asking them to authorize your application to request some of their data.
5. If the user approves, then Google gives your application a short-lived **access token**.
6. Your application requests user data, attaching the access token to the request.
7. If Google determines that your request and the token are valid, it returns the requested data.

Some flows include additional steps, such as using **refresh tokens** to acquire new access tokens. For detailed information about flows for various types of applications, see Google's [OAuth 2.0 documentation](https://developers.google.com/identity/protocols/OAuth2).

Here's the OAuth 2.0 scope information for the Books API:

```
https://www.googleapis.com/auth/books
```

To request access using OAuth 2.0, your application needs the scope information, as well as
information that Google supplies when you register your application (such as the client ID and the
client secret).

**Tip:** The Google APIs client libraries can handle some of the authorization process for you. They are available for a variety of programming languages; check the [page with libraries and samples](https://developers.google.com/books/docs/v1/libraries) for more details.

#### Acquiring and using an API key

Requests to the Books API for public data must be accompanied by an identifier, which can
be an [API key](https://developers.google.com/console/help/generating-dev-keys) or an
[access token](https://developers.google.com/accounts/docs/OAuth2).

To acquire an API key:

1. Open the [Credentials page](https://console.cloud.google.com/apis/credentials) in the API Console.
2. This API supports two types of credentials. Create whichever credentials are appropriate for your project:
   - **OAuth 2.0:** Whenever your application requests private user
     data, it must send an OAuth 2.0 token along with the request. Your
     application first sends a client ID and, possibly, a client secret to
     obtain a token. You can generate OAuth 2.0 credentials for web
     applications, service accounts, or installed applications.

     For more information, see the [OAuth 2.0 documentation](https://developers.google.com/identity/protocols/OAuth2).
   - **API keys:**

     A request that does not provide an OAuth 2.0 token must send an API
     key.

     The key identifies your project and provides API access, quota, and
     reports.

     The API supports several types of restrictions on API keys. If the API key that you
     need doesn't already exist, then create an API key in the Console by
     clicking **[Create credentials](https://console.cloud.google.com/apis/credentials) \> API key** . You can restrict the key before using it
     in production by clicking **Restrict key** and selecting one of the
     **Restrictions**.

To keep your API keys secure, follow the [best practices for
securely using API keys](https://cloud.google.com/docs/authentication/api-keys).

After you have an API key, your application can append the query parameter
`key=yourAPIKey` to all request URLs.

The API key is safe for embedding in URLs; it doesn't need any encoding.

### Google Books IDs

You need to specify ID fields with certain API method calls. There are three
types of IDs used within Google Books:

- **Volume IDs** - Unique strings given to each volume that Google Books knows about. An example of a volume ID is `_LettPDhwR0C`. You can use the API to get the volume ID by making a request that returns a Volume resource; you can find the volume ID in its `id` field.
- **Bookshelf IDs** - Numeric values given to a bookshelf in a user's library. Google provides some pre-defined shelves for every user with the following IDs:
  - Favorites: 0
  - Purchased: 1
  - To Read: 2
  - Reading Now: 3
  - Have Read: 4
  - Reviewed: 5
  - Recently Viewed: 6
  - My eBooks: 7
  - Books For You: 8 *If we have no recommendations for the user, this shelf does not exist.*

  Custom shelves have IDs greater than 1000. A bookshelf ID is unique for a given user, i.e., two users can have a bookshelf with the same ID that refer to different bookshelves. You can use the API to get the bookshelf ID by making a request that returns a Bookshelf resource; you can find the bookshelf ID in its `id` field.
- **User IDs** - Unique numeric values assigned to each user. These values are not necessarily the same ID value used in other Google services. Currently, the only way retrieve the user ID is to extract it from the selfLink in a Bookshelf resource retrieved with an authenticated request. Users can also obtain their own user ID from the Books site. A user cannot obtain the user ID for another user via the API or the Books site; the other user would have to share that information explicitly, by email for example.

<br />

#### IDs on Google Books site


The IDs you use with the Books API are the same IDs used on the
[Google Books](https://books.google.com) site.

- Volume ID  

  When viewing a particular volume on the site, you can find the volume ID in
  the `id` URL parameter. Here is an example:

  ```
  https://books.google.com/ebooks?id=buc0AAAAMAAJ&dq=holmes&as_brr=4&source=webstore_bookcard
  ```

  <br />

- Bookshelf ID  

  When viewing a particular bookshelf on the site, you can find the bookshelf
  ID in the `as_coll` URL parameter. Here is an example:

  ```
  https://books.google.com/books?hl=en&as_coll=0&num=10&uid=11122233344455566778&source=gbs_slider_cls_metadata_0_mylibrary
  ```

  <br />

- User ID  

  When viewing your library on the site, you can find the user ID in the
  `uid` URL parameter. Here is an example:

  ```
  https://books.google.com/books?uid=11122233344455566778&source=gbs_lp_bookshelf_list
  ```

  <br />

### Setting User Location

Google Books respects copyright, contract, and other legal restrictions
associated with the end user's location. As a result, some users might not be
able to access book content from certain countries. For example, certain books
are "previewable" only in the United States; we omit such preview links for
users in other countries. Therefore, the API results are restricted based on
your server or client application's IP address.

## Working with volumes

### Performing a search

You can perform a volumes search by sending an HTTP `GET`
request to the following URI:

```
https://www.googleapis.com/books/v1/volumes?q=search+terms
```

This request has a single required parameter:

- `https://developers.google.com/books/docs/v1/using#q` - Search for volumes that contain this text string. There are special keywords you can specify in the search terms to search in particular fields, such as:
  - `intitle:` Returns results where the text following this keyword is found in the title.
  - `inauthor:` Returns results where the text following this keyword is found in the author.
  - `inpublisher:` Returns results where the text following this keyword is found in the publisher.
  - `subject:` Returns results where the text following this keyword is listed in the category list of the volume.
  - `isbn:` Returns results where the text following this keyword is the ISBN number.
  - `lccn:` Returns results where the text following this keyword is the Library of Congress Control Number.
  - `oclc:` Returns results where the text following this keyword is the Online Computer Library Center number.

<br />

#### Request

Here is an example of searching for Daniel Keyes' "Flowers for Algernon":

```
GET https://www.googleapis.com/books/v1/volumes?q=flowers+inauthor:keyes&key=yourAPIKey
```

Note: Performing a search does not require authentication, so
you do not have to provide the `Authorization` HTTP header with the
`GET` request. However, if the call is made with authentication, each
Volume will include user-specific information, such as purchased status.

#### Response

If the request succeeds, the server responds with a
`200 OK` HTTP status code and the volume results:

```
200 OK

{
 "kind": "books#volumes",
 "items": [
  {
   "kind": "books#volume",
   "id": "_ojXNuzgHRcC",
   "etag": "OTD2tB19qn4",
   "selfLink": "https://www.googleapis.com/books/v1/volumes/_ojXNuzgHRcC",
   "volumeInfo": {
    "title": "Flowers",
    "authors": [
     "Vijaya Khisty Bodach"
    ],
   ...
  },
  {
   "kind": "books#volume",
   "id": "RJxWIQOvoZUC",
   "etag": "NsxMT6kCCVs",
   "selfLink": "https://www.googleapis.com/books/v1/volumes/RJxWIQOvoZUC",
   "volumeInfo": {
    "title": "Flowers",
    "authors": [
     "Gail Saunders-Smith"
    ],
    ...
  },
  {
   "kind": "books#volume",
   "id": "zaRoX10_UsMC",
   "etag": "pm1sLMgKfMA",
   "selfLink": "https://www.googleapis.com/books/v1/volumes/zaRoX10_UsMC",
   "volumeInfo": {
    "title": "Flowers",
    "authors": [
     "Paul McEvoy"
    ],
    ...
  },
  "totalItems": 3
}
```

#### Optional query parameters

In addition to the [standard query parameters](https://developers.google.com/books/docs/v1/using#st_params), you can use the following query parameters when performing a volumes search.

##### Download Format

You use the `download` parameter to restrict the returned results to volumes that have an available
download format of `epub` by setting the` `to the value
`epub`.

The following example searches for books with an epub download available:

```
GET https://www.googleapis.com/books/v1/volumes?q=pride+prejudice&download=epub&key=yourAPIKey
```

##### Filtering

You can use the `filter` parameter to restrict the returned results further by setting it the to one of the following
values:

- `partial` - Returns results where at least parts of the text are previewable.
- `full` - Only returns results where all of the text is viewable.
- `free-ebooks` - Only returns results that are free Google eBooks.
- `paid-ebooks` - Only returns results that are Google eBooks with a price.
- `ebooks` - Only returns results that are Google eBooks, paid or free. Examples of non-eBooks would be publisher content that is available in limited preview and not for sale, or magazines.

The following example restricts search results to those available as free
eBooks:

```
GET https://www.googleapis.com/books/v1/volumes?q=flowers&filter=free-ebooks&key=yourAPIKey
```

##### Pagination

You can paginate the
volumes list by specifying two values in the parameters for the
request:

- `startIndex` - The position in the collection at which to start. The index of the first item is 0.
- `maxResults` - The maximum number of results to return. The default is 10, and the maximum allowable value is 40.

##### Print Type

You can use the `printType` parameter to restrict the returned results to a specific print or publication
type by setting it to one of the
following values:

- `all` - Does not restrict by print type (default).
- `books` - Returns only results that are books.
- `magazines` - Returns results that are magazines.

The following example restricts search results to magazines:

```
GET https://www.googleapis.com/books/v1/volumes?q=time&printType=magazines&key=yourAPIKey
```

##### Projection

You can use the `projection` parameter with one of the following
values to specify a predefined set of Volume fields to return:

- `full` - Returns all Volume fields.
- `lite` - Returns only certain fields. See field descriptions marked with double asterisks in the [Volume reference](https://developers.google.com/books/docs/v1/reference#resource_volumes) to find out which fields are included.

The following example returns search results with limited volume information:

```
GET https://www.googleapis.com/books/v1/volumes?q=flowers&projection=lite&key=yourAPIKey
```

##### Sorting

By default, a volumes search request returns `maxResults` results,
where `maxResults` is the parameter used in pagination (above),
ordered by relevance to search terms.

You can change the ordering by setting the `orderBy` parameter
to be one of these values:

- `relevance` - Returns results in order of the relevance of search terms (this is the default).
- `newest` - Returns results in order of most recently to least recently published.

The following example lists results by published date, newest to oldest:

```
GET https://www.googleapis.com/books/v1/volumes?q=flowers&orderBy=newest&key=yourAPIKey
```

### Retrieving a specific volume

You can retrieve information for a specific volume by sending an HTTP
`GET` request to the Volume resource URI:

```
https://www.googleapis.com/books/v1/volumes/volumeId
```

Replace the `volumeId` path parameter with the ID of the volume to retrieve. See the [Google Books IDs](https://developers.google.com/books/docs/v1/using#ids) section for more
information on volume IDs.

#### Request

Here is an example of a `GET` request that gets a single volume:

```
GET https://www.googleapis.com/books/v1/volumes/zyTCAlFPjgYC?key=yourAPIKey
```

Note: Retrieving volume information does not require
authentication, so you do not have to provide the `Authorization`
HTTP header with the `GET` request. However, if the call is made with
authentication, the Volume will include user-specific information, such as
purchased status.

#### Response

If the request succeeds, the server responds with the `200 OK` HTTP
status code and the Volume resource requested:

```
200 OK

{
 "kind": "books#volume",
 "id": "zyTCAlFPjgYC",
 "etag": "f0zKg75Mx/I",
 "selfLink": "https://www.googleapis.com/books/v1/volumes/zyTCAlFPjgYC",
 "volumeInfo": {
  "title": "The Google story",
  "authors": [
   "David A. Vise",
   "Mark Malseed"
  ],
  "publisher": "Random House Digital, Inc.",
  "publishedDate": "2005-11-15",
  "description": "\"Here is the story behind one of the most remarkable Internet
  successes of our time. Based on scrupulous research and extraordinary access
  to Google, ...",
  "industryIdentifiers": [
   {
    "type": "ISBN_10",
    "identifier": "055380457X"
   },
   {
    "type": "ISBN_13",
    "identifier": "9780553804577"
   }
  ],
  "pageCount": 207,
  "dimensions": {
   "height": "24.00 cm",
   "width": "16.03 cm",
   "thickness": "2.74 cm"
  },
  "printType": "BOOK",
  "mainCategory": "Business & Economics / Entrepreneurship",
  "categories": [
   "Browsers (Computer programs)",
   ...
  ],
  "averageRating": 3.5,
  "ratingsCount": 136,
  "contentVersion": "1.1.0.0.preview.2",
  "imageLinks": {
   "smallThumbnail": "https://books.google.com/books?id=zyTCAlFPjgYC&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api",
   "thumbnail": "https://books.google.com/books?id=zyTCAlFPjgYC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
   "small": "https://books.google.com/books?id=zyTCAlFPjgYC&printsec=frontcover&img=1&zoom=2&edge=curl&source=gbs_api",
   "medium": "https://books.google.com/books?id=zyTCAlFPjgYC&printsec=frontcover&img=1&zoom=3&edge=curl&source=gbs_api",
   "large": "https://books.google.com/books?id=zyTCAlFPjgYC&printsec=frontcover&img=1&zoom=4&edge=curl&source=gbs_api",
   "extraLarge": "https://books.google.com/books?id=zyTCAlFPjgYC&printsec=frontcover&img=1&zoom=6&edge=curl&source=gbs_api"
  },
  "language": "en",
  "infoLink": "https://books.google.com/books?id=zyTCAlFPjgYC&ie=ISO-8859-1&source=gbs_api",
  "canonicalVolumeLink": "https://books.google.com/books/about/The_Google_story.html?id=zyTCAlFPjgYC"
 },
 "saleInfo": {
  "country": "US",
  "saleability": "FOR_SALE",
  "isEbook": true,
  "listPrice": {
   "amount": 11.99,
   "currencyCode": "USD"
  },
  "retailPrice": {
   "amount": 11.99,
   "currencyCode": "USD"
  },
  "buyLink": "https://books.google.com/books?id=zyTCAlFPjgYC&ie=ISO-8859-1&buy=&source=gbs_api"
 },
 "accessInfo": {
  "country": "US",
  "viewability": "PARTIAL",
  "embeddable": true,
  "publicDomain": false,
  "textToSpeechPermission": "ALLOWED_FOR_ACCESSIBILITY",
  "epub": {
   "isAvailable": true,
   "acsTokenLink": "https://books.google.com/books/download/The_Google_story-sample-epub.acsm?id=zyTCAlFPjgYC&format=epub&output=acs4_fulfillment_token&dl_type=sample&source=gbs_api"
  },
  "pdf": {
   "isAvailable": false
  },
  "accessViewStatus": "SAMPLE"
 }
}
```

##### Access Info

The `accessInfo` section is of particular interest in determining
what features are available for an eBook. An `epub` is a flowing text
format ebook, the `epub` section will have an
`isAvailable` property indicating if this type of ebook is available.
It will have a download link if there is a sample for the book or if the user
can read the book either due to having purchased it or due to it being public
domain in the user's location. A `pdf` for Google books indicates a
scanned pages version of the ebook with similar details such as if it is
available and a download link. Google recommends `epub` files for
eReaders and SmartPhones, as scanned pages may be hard to read on these devices.
If there is no `accessInfo` section, the volume is not available as a
Google eBook.

#### Optional query parameters

In addition to the [standard query parameters](https://developers.google.com/books/docs/v1/using#st_params), you
can use the following query parameter when retrieving a specific volume.

##### Projection

You can use the `projection` parameter with one of the following
values to specify a predefined set of Volume fields to return:

- `full` - Returns all Volume fields.
- `lite` - Returns only certain fields. See field descriptions marked with double asterisks in the [Volume reference](https://developers.google.com/books/docs/v1/reference#resource_volumes) to find out which fields are included.

The following example returns limited volume information for a single volume:

```
GET https://www.googleapis.com/books/v1/volumes/zyTCAlFPjgYC?projection=lite&key=yourAPIKey
```

## Working with bookshelves

### Retrieving a list of a user's public bookshelves

You can retrieve a list of a user's public bookshelves by sending an HTTP
`GET` request to the URI with the following format:

```
https://www.googleapis.com/books/v1/users/userId/bookshelves
```

Replace the userId path parameter with the ID
of the user whose bookshelves you would like to retrieve. See the
[Google Books IDs](https://developers.google.com/books/docs/v1/using#ids) section for more information on user IDs.

#### Request

Here is an example:

```
GET https://www.googleapis.com/books/v1/users/1112223334445556677/bookshelves&key=yourAPIKey
```

Since a user does not have to be authenticated to retrieve information regarding
public bookshelves, you do not have to provide the `Authorization` HTTP
header with the `GET` request.

#### Response

If the request succeeds, the server responds with the
`200 OK` HTTP status code and the list of bookshelves:

```
200 OK

{
 "kind": "books#bookshelves",
 "items": [
  {
   ...
  },
  {
   "kind": "books#bookshelf",
   "id": 3,
   "selfLink": "https://www.googleapis.com/books/v1/users/1112223334445556677/bookshelves/3",
   "title": "Reading now",
   "description": "",
   "access": "PUBLIC",
   "updated": "2011-02-02T20:34:20.146Z",
   "created": "2011-02-02T20:34:20.146Z",
   "volumeCount": 2,
   "volumesLastUpdated": "2011-02-02T20:34:20.110Z"
  },
  ...
 ]
}
```

#### Optional query parameters

You can use the [standard query parameters](https://developers.google.com/books/docs/v1/using#st_params) when
retrieving the list of a user's public bookshelves.

### Retrieving a specific public bookshelf

You can retrieve a specific public bookshelf by sending an HTTP
`GET` request to the URI with the following format:

```
https://www.googleapis.com/books/v1/users/userId/bookshelves/shelf
```

Replace the userId and
shelf path parameters with the IDs that specify
the user and the bookshelf you want to retrieve. See the
[Google Books IDs](https://developers.google.com/books/docs/v1/using#ids) section for more information.

#### Request

Here is an example:

```
GET https://www.googleapis.com/books/v1/users/1112223334445556677/bookshelves/3?key=yourAPIKey
```

Since a user does not have to be authenticated to retrieve information regarding
public bookshelves, you do not have to provide the `Authorization` HTTP
header with the `GET` request.

#### Response

If the request succeeds, the server responds with the
`200 OK` HTTP status code and the bookshelf resource:

```
200 OK

{
  "kind": "books#bookshelf",
  "id": 3,
  "selfLink": "https://www.googleapis.com/books/v1/users/1112223334445556677/bookshelves/3",
  "title": "Reading now",
  "description": "",
  "access": "PUBLIC",
  "updated": "2011-02-02T20:34:20.146Z",
  "created": "2011-02-02T20:34:20.146Z",
  "volumeCount": 2,
  "volumesLastUpdated": "2011-02-02T20:34:20.110Z"
}
```

#### Optional query parameters

You can use the [standard query parameters](https://developers.google.com/books/docs/v1/using#st_params) when
retrieving a specific public bookshelf.

### Retrieving a list of volumes on a public bookshelf

You can retrieve a list of volumes on a user's public bookshelf by sending an HTTP
`GET` request the a URI with the following format:

```
https://www.googleapis.com/books/v1/user/userId/bookshelves/shelf/volumes
```

#### Request

Here is an example:

```
GET https://www.googleapis.com/books/v1/users/1112223334445556677/bookshelves/3/volumes?key=yourAPIKey
```

Replace the userId and
shelf path parameters with the IDs that specify
the user and the bookshelf you want to retrieve. See the
[Google Books IDs](https://developers.google.com/books/docs/v1/using#ids) section for more information.

Since a user does not have to be authenticated to retrieve information regarding
public bookshelves, you do not have to provide the `Authorization` HTTP
header with the `GET` request.

#### Response

If the request succeeds, the server responds with a `200 OK`
HTTP status code and the list of the user's bookshelves:

```
200 OK

{
 "kind": "books#volumes",
 "items": [
  {
   "kind": "books#volume",
   "id": "AZ5J6B1-4BoC",
   "etag": "kIzQA7IUObk",
   "selfLink": "https://www.googleapis.com/books/v1/volumes/AZ5J6B1-4BoC",
   "volumeInfo": {
    "title": "The Girl Who Kicked the Hornet's Nest",
    "authors": [
     "Stieg Larsson"
    ],
    "publisher": "Knopf",
    "publishedDate": "2010-05-25",
    ...
  },
  {
   "kind": "books#volume",
   "id": "UvK1Slvkz3MC",
   "etag": "otKmdbRgdFQ",
   "selfLink": "https://www.googleapis.com/books/v1/volumes/UvK1Slvkz3MC",
   "volumeInfo": {
    "title": "The Girl who Played with Fire",
    "authors": [
     "Stieg Larsson"
    ],
    "publisher": "Knopf",
    "publishedDate": "2009-07-28",
    ...
  },
  {
   "kind": "books#volume",
   "id": "OBM3AAAAIAAJ",
   "etag": "xb47kTr8HsQ",
   "selfLink": "https://www.googleapis.com/books/v1/volumes/OBM3AAAAIAAJ",
   "volumeInfo": {
    "title": "The Sign of Four",
    "authors": [
     "Sir Arthur Conan Doyle"
    ],
    "publishedDate": "1890",
    ...
  }
 ],
 "totalItems": 3
}
```

#### Optional query parameters

In addition to the [standard query parameters](https://developers.google.com/books/docs/v1/using#st_params), you can use the following query parameter when retrieving a list of volumes on a public bookshelf.

##### Pagination

You can paginate the
volumes list by specifying two values in the parameters for the
request:

- `startIndex` - The position in the collection at which to start. The index of the first item is 0.
- `maxResults` - The maximum number of results to return. The default is 10, and the maximum allowable value is 40.

## Working with bookshelves in "My Library"

All "My Library" requests apply to the authenticated user's data.

### Retrieving a list of my bookshelves

You can retrieve a listing of all of the authenticated user's bookshelves by
sending an HTTP `GET` request to the URI with the following format:

```
https://www.googleapis.com/books/v1/mylibrary/bookshelves
```

#### Request

Here is an example:

```
GET https://www.googleapis.com/books/v1/mylibrary/bookshelves?key=yourAPIKey
Authorization: /* auth token here */
```

Note: The user must be authenticated to retrieve a listing of "My Library"
bookshelves. So you must provide the `Authorization` HTTP header with the
`GET` request.

#### Response

If the request succeeds, the server responds with the `200 OK` HTTP
status code and the list of all bookshelves for the current authenticated user:

```
200 OK

{
 "kind": "books#bookshelves",
 "items": [
  {
   "kind": "books#bookshelf",
   "id": 0,
   "selfLink": "https://www.googleapis.com/books/v1/users/1112223334445556677/bookshelves/0",
   "title": "Favorites",
   "access": "PRIVATE",
   "updated": "2011-04-22T04:03:15.416Z",
   "created": "2011-04-22T04:03:15.416Z",
   "volumeCount": 0,
   "volumesLastUpdated": "2011-04-22T04:03:17.000Z"
  },
  {
   "kind": "books#bookshelf",
   "id": 3,
   "selfLink": "https://www.googleapis.com/books/v1/users/1112223334445556677/bookshelves/3",
   "title": "Reading now",
   "access": "PUBLIC",
   "updated": "2010-11-11T19:44:22.377Z",
   "created": "2010-11-11T19:44:22.377Z",
   "volumeCount": 1,
   "volumesLastUpdated": "2010-11-11T19:44:22.341Z"
  }
 ]
}
```

#### Optional query parameters

You can use the [standard query parameters](https://developers.google.com/books/docs/v1/using#st_params) when
retrieving the list of the authenticated user's bookshelves.

### Retrieving a list of volumes on my bookshelf

You can retrieve a listing of the volumes on the authenticated user's bookshelf by
sending an HTTP `GET` request to the URI with the following format:

```
https://www.googleapis.com/books/v1/mylibrary/bookshelves/shelf/volumes
```

Replace the shelf path parameter with the ID of
the bookshelf. See the [Google Books IDs](https://developers.google.com/books/docs/v1/using#ids) section for more
information on bookshelf IDs.

#### Request

Here is an example:

```
GET https://www.googleapis.com/books/v1/mylibrary/bookshelves/7/volumes?key=yourAPIKey
Authorization: /* auth token here */
```

Note: The user must be authenticated to retrieve a listing of
"My Library" volumes. So you must provide the `Authorization`
HTTP header with the `GET` request.

#### Response

If the request succeeds, the server responds with the `200 OK`
HTTP status code and list of bookshelf volumes:

```
200 OK

{
 "kind": "books#volumes",
 "items": [
  {
   "kind": "books#volume",
   "id": "AZ5J6B1-4BoC",
   "etag": "kIzQA7IUObk",
   "selfLink": "https://www.googleapis.com/books/v1/volumes/AZ5J6B1-4BoC",
   "volumeInfo": {
    "title": "The Girl Who Kicked the Hornet's Nest",
    "authors": [
     "Stieg Larsson"
    ],
    "publisher": "Knopf",
    "publishedDate": "2010-05-25",
    ...
  },
  {
   "kind": "books#volume",
   "id": "UvK1Slvkz3MC",
   "etag": "otKmdbRgdFQ",
   "selfLink": "https://www.googleapis.com/books/v1/volumes/UvK1Slvkz3MC",
   "volumeInfo": {
    "title": "The Girl who Played with Fire",
    "authors": [
     "Stieg Larsson"
    ],
    "publisher": "Knopf",
    "publishedDate": "2009-07-28",
    ...
  },
  {
   "kind": "books#volume",
   "id": "OBM3AAAAIAAJ",
   "etag": "xb47kTr8HsQ",
   "selfLink": "https://www.googleapis.com/books/v1/volumes/OBM3AAAAIAAJ",
   "volumeInfo": {
    "title": "The Sign of Four",
    "authors": [
     "Sir Arthur Conan Doyle"
    ],
    "publishedDate": "1890",
    ...
  }
 ],
 "totalItems": 3
}
```

#### Optional query parameters

In addition to the [standard query parameters](https://developers.google.com/books/docs/v1/using#st_params), you can use the following query parameter when retrieving a list of volumes on one of the authenticated user's bookshelves.

##### Pagination

You can paginate the
volumes list by specifying two values in the parameters for the
request:

- `startIndex` - The position in the collection at which to start. The index of the first item is 0.
- `maxResults` - The maximum number of results to return. The default is 10.

### Adding a volume to my bookshelf

To add a volume to the authenticated user's bookshelf, send an HTTP
`POST` request to the URI with the following format:

```
https://www.googleapis.com/books/v1/mylibrary/bookshelves/shelf/addVolume
```

Replace the shelf path parameter with the ID
of the bookshelf. See the [Google Books IDs](https://developers.google.com/books/docs/v1/using#ids) section for more
information on bookshelf IDs.

The request has a single required query parameter:

- `volumeId` - The ID of the volume. See the [Google Books IDs](https://developers.google.com/books/docs/v1/using#ids) section for more information on volume IDs.

#### Request

Here is an example to add "Flowers for Algernon" to the "Favorites" bookshelf:

```
POST https://www.googleapis.com/books/v1/mylibrary/bookshelves/0/addVolume?volumeId=NRWlitmahXkC&key=yourAPIKey
Authorization: /* auth token here */
Content-Type: application/json
Content-Length: CONTENT_LENGTH
```

Note: The user must be authenticated to make modifications to a
bookshelf, so you must provide the `Authorization` HTTP header with
the `POST` request. No data, however, is required with this
`POST`.

#### Response

If the request succeeds, the server responds with the `204 No Content` HTTP
status code.

#### Optional query parameters

You can use the [standard query parameters](https://developers.google.com/books/docs/v1/using#st_params) when adding a volume to one of the authenticated user's bookshelves.

### Removing a volume from my bookshelf

To remove a volume from the authenticated user's bookshelf, send an HTTP
`POST` to the URI with the following format:

```
https://www.googleapis.com/books/v1/mylibrary/bookshelves/shelf/removeVolume
```

Replace the shelf path parameter with the ID of
the bookshelf. See the [Google Books IDs](https://developers.google.com/books/docs/v1/using#ids) section for more
information on bookshelf IDs.

The request has a single required query parameter:

- `volumeId` - The ID of the volume. See the [Google Books IDs](https://developers.google.com/books/docs/v1/using#ids) section for more information on volume IDs.

<br />

#### Request

Here is an example to remove "Flowers for Algernon" from the "Favorites"
bookshelf:

```
POST https://www.googleapis.com/books/v1/mylibrary/bookshelves/0/removeVolume?volumeId=NRWlitmahXkC&key=yourAPIKey
Authorization: /* auth token here */
Content-Type: application/json
Content-Length: CONTENT_LENGTH
```

Note: The user must be authenticated to make modifications to a
bookshelf, so you must provide the `Authorization` HTTP header with
the `POST` request. No data, however, is required with this
`POST`.

#### Response

If the request succeeds, the server responds with a `204 No Content`
status code.

#### Optional query parameters

You can use the [standard query parameters](https://developers.google.com/books/docs/v1/using#st_params) when removing a volume from one of the authenticated user's bookshelves.

### Clearing all volumes from my bookshelf

To remove all of the volumes from the authenticated user's bookshelf, send an
HTTP `POST` to the URI with the following format:

```
https://www.googleapis.com/books/v1/mylibrary/bookshelves/shelf/clearVolumes
```

Replace the shelf path parameter with the ID of
the bookshelf. See the [Google Books IDs](https://developers.google.com/books/docs/v1/using#ids) section for more
information on bookshelf IDs.

#### Request

Here is an example to clear the "Favorites" bookshelf:

```
POST https://www.googleapis.com/books/v1/mylibrary/bookshelves/0/clearVolumes?key=yourAPIKey
Authorization: /* auth token here */
Content-Type: application/json
Content-Length: CONTENT_LENGTH
  
```

Note: The user must be authenticated to make modifications to a
bookshelf, so you must provide the `Authorization` HTTP header with
the `POST` request. No data, however, is required with this
`POST`.

#### Response

If the request succeeds, the server responds with a
`204 No Content` status code.

#### Optional query parameters

You can use the [standard query parameters](https://developers.google.com/books/docs/v1/using#st_params) when clearing all volumes from one of the authenticated user's bookshelves.

## Query parameter reference

The query parameters you can use with the Books API are summarized in this section. All parameter values need to be URL encoded.

### Standard query parameters


Query parameters that apply to all Books API operations are documented at
[System Parameters](https://cloud.google.com/apis/docs/system-parameters).

<br />

### API-specific query parameters

Request parameters that apply only to specific operations in the Books API are summarized in the following table.

| Parameter | Meaning | Notes | Applicability |
|---|---|---|---|
| `download` | Restrict to volumes by download availability. | - Currently, the only supported value is `epub`. - Purchase may be required for download access. | - [Performing a search](https://developers.google.com/books/docs/v1/using#PerformingSearch) |
| `filter` | Filter search results by volume type and availability. | - Supported filters are: - `filter=partial` - Restrict results to volumes where at least part of the text are previewable. - `filter=full` - Restrict results to volumes where all of the text is viewable. - `filter=free-ebooks` - Restrict results to free Google eBooks. - `filter=paid-ebooks` - Restrict results to Google eBooks with a price for purchase. - `filter=ebooks` - Restrict results to Google eBooks, paid or free.Examples of non-eBooks would be publisher content that is available in limited preview and not for sale, or magazines. | - [Performing a search](https://developers.google.com/books/docs/v1/using#PerformingSearch) |
| `langRestrict` | Restricts the volumes returned to those that are tagged with the specified language. | - Restrict the search results to those with a certain language by specifying `langRestrict` to a two-letter ISO-639-1 code, such as "en" or "fr". | - [Performing a search](https://developers.google.com/books/docs/v1/using#PerformingSearch) |
| `maxResults` | The maximum number of elements to return with this request. | - For any request for all items in a collection, you can paginate results by specifying `startIndex` and `maxResults` in the parameters for the request. - Default: `maxResults=10` - Maximum allowable value: `maxResults=40.` | - [Performing a search](https://developers.google.com/books/docs/v1/using#PerformingSearch) - [List user bookshelves](https://developers.google.com/books/docs/v1/using#RetrievingBookshelves) - [List user bookshelf volumes](https://developers.google.com/books/docs/v1/using#RetrievingBookshelfVolumes) - [List my bookshelves](https://developers.google.com/books/docs/v1/using#RetrievingMyBookshelves) - [List my bookshelf volumes](https://developers.google.com/books/docs/v1/using#RetrievingMyBookshelfVolumes) |
| `orderBy` | Order of the volume search results. | - By default, a search request returns `maxResults` results, where `maxResults` is the parameter used in pagination, ordered by most relevant first. - You can change the ordering by setting the `orderBy` parameter to be one of these values: - `orderBy=relevance` - Returns search results in order of the most relevant to least (this is the default). - `orderBy=newest` - Returns search results in order of the newest published date to the oldest. | - [Performing a search](https://developers.google.com/books/docs/v1/using#PerformingSearch) |
| `printType` | Restrict to books or magazines. | - Supported values are: - `printType=all` - Return all volume content types (no restriction). This is the default. - `printType=books` - Return just books. - `printType=magazines` - Return just magazines. | - [Performing a search](https://developers.google.com/books/docs/v1/using#PerformingSearch) |
| `projection` | Restrict volume information returned to a subset of fields. | - Supported projections are: - `projection=full` - Includes all volume metadata (default). - `projection=lite` - Includes only a subject of volume and access metadata. | - [Performing a search](https://developers.google.com/books/docs/v1/using#PerformingSearch) - [Retrieving a volume](https://developers.google.com/books/docs/v1/using#RetrievingVolume) - [List user bookshelf volumes](https://developers.google.com/books/docs/v1/using#RetrievingBookshelfVolumes) - [List my bookshelf volumes](https://developers.google.com/books/docs/v1/using#RetrievingMyBookshelfVolumes) |
| `q` | Full-text query string. | - When creating a query, list search terms separated by a '+', in the form `q``=term1+term2_term3`. (Alternatively, you can separate them with a space, but as with all of the query parameter values, the spaces must then be URL encoded.) The API returns all entries that match all of the search terms (like using AND between terms). Like Google's web search, the API searches on complete words (and related words with the same stem), not substrings. - To search for an exact phrase, enclose the phrase in quotation marks: `q="exact phrase"`. - To exclude entries that match a given term, use the form `q=-term`. - The search terms are case-insensitive. - Example: to search for all entries that contain the exact phrase `"Elizabeth Bennet"` and the word `"Darcy"` but don't contain the word `"Austen"`, use the following query parameter value: ` ``q="Elizabeth+Bennet"+Darcy-Austen` - There are special (case-sensitive) keywords you can specify in the search terms to search in particular fields, such as: - `intitle`: Returns results where the text following this keyword is found in the title. - `inauthor`: Returns results where the text following this keyword is found in the author. - `inpublisher`: Returns results where the text following this keyword is found in the publisher. - `subject`: Returns results where the text following this keyword is listed in the category list of the volume. - `isbn`: Returns results where the text following this keyword is the ISBN number. - `lccn`: Returns results where the text following this keyword is the Library of Congress Control Number. - `oclc`: Returns results where the text following this keyword is the Online Computer Library Center number. | - [Performing a search](https://developers.google.com/books/docs/v1/using#PerformingSearch) |
| `startIndex` | The position in the collection at which to start the list of results. | - For any request for all items in a collection, you can paginate results by specifying `startIndex` and `maxResults` in the parameters for the request. - The index of the first item is 0. | - [Performing a search](https://developers.google.com/books/docs/v1/using#PerformingSearch) - [List user bookshelves](https://developers.google.com/books/docs/v1/using#RetrievingBookshelves) - [List user bookshelf volumes](https://developers.google.com/books/docs/v1/using#RetrievingBookshelfVolumes) - [List my bookshelves](https://developers.google.com/books/docs/v1/using#RetrievingMyBookshelves) - [List my bookshelf volumes](https://developers.google.com/books/docs/v1/using#RetrievingMyBookshelfVolumes) |
| `volumeId` | Identifies a volume associated with the request. | - Specifies the volume to add or remove from a bookshelf. | - [Adding a volume to my bookshelf](https://developers.google.com/books/docs/v1/using#AddVolumetoBookshelf) - [Removing a volume from my bookshelf](https://developers.google.com/books/docs/v1/using#RemoveVolumefromBookshelf) |

<br />


# Performance Tips

This document covers some techniques you can use to improve the performance of your application. In some cases, examples from other APIs or generic APIs are used to illustrate the ideas presented. However, the same concepts are applicable to the Books API.

## Compression using gzip

An easy and convenient way to reduce the bandwidth needed for each request is to enable gzip compression. Although this requires additional CPU time to uncompress the results, the trade-off with network costs usually makes it very worthwhile.

In order to receive a gzip-encoded response you must do two things: Set an `Accept-Encoding` header, and modify your user agent to contain the string `gzip`. Here is an example of properly formed HTTP headers for enabling gzip compression:

```
Accept-Encoding: gzip
User-Agent: my program (gzip)
```

## Working with partial resources

Another way to improve the performance of your API calls is by sending and receiving only the portion of the data that you're interested in. This lets your application avoid transferring, parsing, and storing unneeded fields, so it can use resources including network, CPU, and memory more efficiently.

There are two types of partial requests:

- [Partial response](https://developers.google.com/books/docs/v1/performance#partial-response): A request where you specify which fields to include in the response (use the `fields` request parameter).
- [Patch](https://developers.google.com/books/docs/v1/performance#patch): An update request where you send only the fields you want to change (use the `PATCH` HTTP verb).

More details on making partial requests are provided in the following sections.

### Partial response

By default, the server sends back the full representation of a resource after processing requests. For better performance, you can ask the server to send only the fields you really need and get a *partial response* instead.

To request a partial response, use the `fields` request parameter to specify the fields you want returned. You can use this parameter with any request that returns response data.

Note that the `fields` parameter only affects the response data; it does not affect the data that you need to send, if any. To reduce the amount of data you send when modifying resources, use a [patch](https://developers.google.com/books/docs/v1/performance#patch) request.

#### Example

The following example shows the use of the `fields` parameter with a generic (fictional) "Demo" API.

**Simple request:** This HTTP `GET` request omits the `fields` parameter and returns the full resource.

```
https://www.googleapis.com/demo/v1
```

**Full resource response:** The full resource data includes the following fields, along with many others that have been omitted for brevity.

```
{
  "kind": "demo",
  ...
  "items": [
  {
    "title": "First title",
    "comment": "First comment.",
    "characteristics": {
      "length": "short",
      "accuracy": "high",
      "followers": ["Jo", "Will"],
    },
    "status": "active",
    ...
  },
  {
    "title": "Second title",
    "comment": "Second comment.",
    "characteristics": {
      "length": "long",
      "accuracy": "medium"
      "followers": [ ],
    },
    "status": "pending",
    ...
  },
  ...
  ]
}
```

**Request for a partial response:** The following request for this same resource uses the `fields` parameter to significantly reduce the amount of data returned.

```
https://www.googleapis.com/demo/v1?fields=kind,items(title,characteristics/length)
```

**Partial response:** In response to the request above, the server sends back a response that contains only the kind information along with a pared-down items array that includes only HTML title and length characteristic information in each item.

```
200 OK
```

```
{
  "kind": "demo",
  "items": [{
    "title": "First title",
    "characteristics": {
      "length": "short"
    }
  }, {
    "title": "Second title",
    "characteristics": {
      "length": "long"
    }
  },
  ...
  ]
}
```

Note that the response is a JSON object that includes only the selected fields and their enclosing parent objects.

Details on how to format the `fields` parameter is covered next, followed by more details about what exactly gets returned in the response.

#### Fields parameter syntax summary

The format of the `fields` request parameter value is loosely based on XPath syntax. The supported syntax is summarized below, and additional examples are provided in the following section.

- Use a comma-separated list to select multiple fields.
- Use `a/b` to select a field `b` that is nested within field `a`; use `a/b/c` to select a field `c` nested within `b`.   

  **Exception:** For API responses that use "data" wrappers, where the response is nested within a `data` object that looks like `data: { ... }`, do not include "`data`" in the `fields` specification. Including the data object with a fields specification like `data/a/b` causes an error. Instead, just use a `fields` specification like `a/b`.
- Use a sub-selector to request a set of specific sub-fields of arrays or objects by placing expressions in parentheses "`( )`".

  For example: `fields=items(id,author/email)` returns only the item ID and author's email for each element in the items array. You can also specify a single sub-field, where `fields=items(id)` is equivalent to `fields=items/id`.
- Use wildcards in field selections, if needed. For example: `fields=items/pagemap/*` selects all objects in a pagemap.

#### More examples of using the fields parameter

The examples below include descriptions of how the `fields` parameter value affects the response.

**Note:** As with all query parameter values, the `fields` parameter value must be URL encoded. For better readability, the examples in this document omit the encoding.

Identify the fields you want returned, or make field selections.
:   The `fields` request parameter value is a comma-separated list of fields, and each field is specified relative to the root of the response. Thus, if you are performing a list operation, the response is a collection, and it generally includes an array of resources. If you are performing an operation that returns a single resource, fields are specified relative to that resource. If the field you select is (or is part of) an array, the server returns the selected portion of all elements in the array.  

    <br />


    Here are some collection-level examples:  

    | Examples | Effect |
    |---|---|
    | `items` | Returns all elements in the items array, including all fields in each element, but no other fields. |
    | `etag,items` | Returns both the `etag` field and all elements in the items array. |
    | `items/title` | Returns only the `title` field for all elements in the items array. <br /> Whenever a nested field is returned, the response includes the enclosing parent objects. The parent fields do not include any other child fields unless they are also selected explicitly. |
    | `context/facets/label` | Returns only the `label` field for all members of the `facets` array, which is itself nested under the `context` object. |
    | `items/pagemap/*/title` | For each element in the items array, returns only the `title` field (if present) of all objects that are children of `pagemap`. |


    <br />


    Here are some resource-level examples:  

    | Examples | Effect |
    |---|---|
    | `title` | Returns the `title` field of the requested resource. |
    | `author/uri` | Returns the `uri` sub-field of the `author` object in the requested resource. |
    | `links/*/href` | Returns the `href` field of all objects that are children of `links`. |


Request only parts of specific fields using sub-selections.
:   By default, if your request specifies particular fields, the server returns the objects or array elements in their entirety. You can specify a response that includes only certain sub-fields. You do this using "`( )`" sub-selection syntax, as in the example below.

    | Example | Effect |
    |---|---|
    | `items(title,author/uri)` | Returns only the values of the `title` and author's `uri` for each element in the items array. |


<br />

#### Handling partial responses

After a server processes a valid request that includes the `fields` query parameter, it sends back an HTTP `200 OK` status code, along with the requested data. If the `fields` query parameter has an error or is otherwise invalid, the server returns an HTTP `400 Bad Request` status code, along with an error message telling the user what was wrong with their fields selection (for example, `"Invalid field selection a/b"`).

Here is the partial response example shown in the [introductory section](https://developers.google.com/books/docs/v1/performance#partial-response) above. The request uses the `fields` parameter to specify which fields to return.

```
https://www.googleapis.com/demo/v1?fields=kind,items(title,characteristics/length)
```

The partial response looks like this:

```
200 OK
```

```
{
  "kind": "demo",
  "items": [{
    "title": "First title",
    "characteristics": {
      "length": "short"
    }
  }, {
    "title": "Second title",
    "characteristics": {
      "length": "long"
    }
  },
  ...
  ]
}
```

**Note:** For APIs that support query parameters for data pagination (`maxResults` and `nextPageToken`, for example), use those parameters to reduce the results of each query to a manageable size. Otherwise, the performance gains possible with partial response might not be realized.

<br />

### Patch (partial update)

You can also avoid sending unnecessary data when modifying resources. To send updated data only for the specific fields that you're changing, use the HTTP `PATCH` verb. The patch semantics described in this document are different (and simpler) than they were for the older, GData implementation of partial update.

The short example below shows how using patch minimizes the data you need to send to make a small update.

#### Example

This example shows a simple patch request to update only the title of a generic (fictional) "Demo" API resource. The resource also has a comment, a set of characteristics, status, and many other fields, but this request only sends the `title` field, since that's the only field being modified:

```
PATCH https://www.googleapis.com/demo/v1/324
Authorization: Bearer your_auth_token
Content-Type: application/json

{
  "title": "New title"
}
```

Response:

```
200 OK
```

```
{
  "title": "New title",
  "comment": "First comment.",
  "characteristics": {
    "length": "short",
    "accuracy": "high",
    "followers": ["Jo", "Will"],
  },
  "status": "active",
  ...
}
```

The server returns a `200 OK` status code, along with the full representation of the updated resource. Since only the `title` field was included in the patch request, that's the only value that is different from before.

**Note:** If you use the [partial response](https://developers.google.com/books/docs/v1/performance#partial-response) `fields` parameter in combination with patch, you can increase the efficiency of your update requests even further. A patch request only reduces the size of the request. A partial response reduces the size of the response. So to reduce the amount of data sent in both directions, use a patch request with the `fields` parameter.

#### Semantics of a patch request

The body of the patch request includes only the resource fields you want to modify. When you specify a field, you must include any enclosing parent objects, just as the enclosing parents are returned with a [partial response](https://developers.google.com/books/docs/v1/performance#example-partial-response). The modified data you send is merged into the data for the parent object, if there is one.

- **Add:** To add a field that doesn't already exist, specify the new field and its value.
- **Modify:** To change the value of an existing field, specify the field and set it to the new value.  
- **Delete:** To delete a field, specify the field and set it to `null`. For example, `"comment": null`. You can also delete an entire object (if it is mutable) by setting it to `null`. If you are using the [Java API Client Library](https://developers.google.com/java/docs/reference), use `Data.NULL_STRING` instead; for details, see [JSON null](https://googleapis.github.io/google-http-java-client/json.html#json-null).

**Note about arrays:** Patch requests that contain arrays replace the existing array with the one you provide. You cannot modify, add, or delete items in an array in a piecemeal fashion.

#### Using patch in a read-modify-write cycle

It can be a useful practice to start by retrieving a partial response with the data you want to modify. This is especially important for resources that use ETags, since you must provide the current ETag value in the `If-Match` HTTP header in order to update the resource successfully. After you get the data, you can then modify the values you want to change and send the modified partial representation back with a patch request. Here is an example that assumes the Demo resource uses ETags:

```
GET https://www.googleapis.com/demo/v1/324?fields=etag,title,comment,characteristics
Authorization: Bearer your_auth_token
```

This is the partial response:

```
200 OK
```

```
{
  "etag": "ETagString"
  "title": "New title"
  "comment": "First comment.",
  "characteristics": {
    "length": "short",
    "level": "5",
    "followers": ["Jo", "Will"],
  }
}
```

The following patch request is based on that response. As shown below, it also uses the `fields` parameter to limit the data returned in the patch response:

```
PATCH https://www.googleapis.com/demo/v1/324?fields=etag,title,comment,characteristics
Authorization: Bearer your_auth_token
Content-Type: application/json
If-Match: "ETagString"
```

```
{
  "etag": "ETagString"
  "title": "",                  /* Clear the value of the title by setting it to the empty string. */
  "comment": null,              /* Delete the comment by replacing its value with null. */
  "characteristics": {
    "length": "short",
    "level": "10",              /* Modify the level value. */
    "followers": ["Jo", "Liz"], /* Replace the followers array to delete Will and add Liz. */
    "accuracy": "high"          /* Add a new characteristic. */
  },
}
```

The server responds with a 200 OK HTTP status code, and the partial representation of the updated resource:

```
200 OK
```

```
{
  "etag": "newETagString"
  "title": "",                 /* Title is cleared; deleted comment field is missing. */
  "characteristics": {
    "length": "short",
    "level": "10",             /* Value is updated.*/
    "followers": ["Jo" "Liz"], /* New follower Liz is present; deleted Will is missing. */
    "accuracy": "high"         /* New characteristic is present. */
  }
}
```

#### Constructing a patch request directly

For some patch requests, you need to base them on the data you previously retrieved. For example, if you want to add an item to an array and don't want to lose any of the existing array elements, you must get the existing data first. Similarly, if an API uses ETags, you need to send the previous ETag value with your request in order to update the resource successfully.

**Note:** You can use an `"If-Match: *"` HTTP header to force a patch to go through when ETags are in use. If you do this, you don't need to do the read before the write.

For other situations, however, you can construct the patch request directly, without first retrieving the existing data. For example, you can easily set up a patch request that updates a field to a new value or adds a new field. Here is an example:

```
PATCH https://www.googleapis.com/demo/v1/324?fields=comment,characteristics
Authorization: Bearer your_auth_token
Content-Type: application/json

{
  "comment": "A new comment",
  "characteristics": {
    "volume": "loud",
    "accuracy": null
  }
}
```

With this request, if the comment field has an existing value, the new value overwrites it; otherwise it is set to the new value. Similarly, if there was a volume characteristic, its value is overwritten; if not, it is created. The accuracy field, if set, is removed.

#### Handling the response to a patch

After processing a valid patch request, the API returns a `200 OK` HTTP response code along with the complete representation of the modified resource. If ETags are used by the API, the server updates ETag values when it successfully processes a patch request, just as it does with `PUT`.

The patch request returns the entire resource representation unless you use the `fields` parameter to reduce the amount of data it returns.

If a patch request results in a new resource state that is syntactically or semantically invalid, the server returns a `400 Bad Request` or `422 Unprocessable Entity` HTTP status code, and the resource state remains unchanged. For example, if you attempt to delete the value for a required field, the server returns an error.

#### Alternate notation when PATCH HTTP verb is not supported

If your firewall does not allow HTTP `PATCH` requests, then do an HTTP `POST` request and set the override header to `PATCH`, as shown below:

```
POST https://www.googleapis.com/...
X-HTTP-Method-Override: PATCH
...
```

#### Difference between patch and update

In practice, when you send data for an update request that uses the HTTP `PUT` verb, you only need to send those fields which are either required or optional; if you send values for fields that are set by the server, they are ignored. Although this might seem like another way to do a partial update, this approach has some limitations. With updates that use the HTTP `PUT` verb, the request fails if you don't supply required parameters, and it clears previously set data if you don't supply optional parameters.

It's much safer to use patch for this reason. You only supply data for the fields you want to change; fields that you omit are not cleared. The only exception to this rule occurs with repeating elements or arrays: If you omit all of them, they stay just as they are; if you provide any of them, the whole set is replaced with the set that you provide.


# Developer's Guide

The Embedded Viewer API lets you embed book content from
[Google Books](https://books.google.com/) directly in your web pages with JavaScript. The API also provides a number of utilities for manipulating book previews, and is often used together with the other APIs described on this site.

The [Preview Wizard](https://developers.google.com/books/docs/preview-wizard) is a tool built atop the Embedded Viewer API that makes it easier to add preview capabilities to your site by just copying a couple lines of code. This document is intended for more advanced developers looking to customize how the viewer appears on their sites.

## Audience

This documentation is designed for people familiar with
[JavaScript](http://www.ecma-international.org/publications/standards/Ecma-262.htm)
programming and object-oriented programming concepts. You should also be familiar with
[Google Books](https://books.google.com/) from a user's point of view. There are
many [JavaScript tutorials](https://www.google.com/search?q=javascript+tutorials)
available on the Web.

This conceptual documentation is not complete and exhaustive; it is designed to let you quickly start
exploring and developing cool applications with the Embedded Viewer API. Advanced users should may be interested in the
[Embedded Viewer API Reference](https://developers.google.com/books/docs/viewer/reference), which provides comprehensive details
on supported methods and responses.

As indicated above, beginners may want to start with the [Preview Wizard](https://developers.google.com/books/docs/preview-wizard), which automatically generates the code necessary to embed basic previews on your site.

## The "Hello, World" of the Embedded Viewer API

The easiest way to start learning about the Embedded Viewer API is to see a simple example.
The following web page displays a 600x500 preview of
[*Mountain View*](https://books.google.com/books?id=Py8u3Obs4f4C&printsec=frontcover), by Nicholas
Perry, ISBN 0738531367 (part of Arcadia Publishing's "Images of America" series):

```
<!DOCTYPE html "-//W3C//DTD XHTML 1.0 Strict//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
    <title>Google Books Embedded Viewer API Example</title>
    <script type="text/javascript" src="https://www.google.com/books/jsapi.js"></script>
    <script type="text/javascript">
      google.books.load();

      function initialize() {
        var viewer = new google.books.DefaultViewer(document.getElementById('viewerCanvas'));
        viewer.load('ISBN:0738531367');
      }

      google.books.setOnLoadCallback(initialize);
    </script>
  </head>
  <body>
    <div id="viewerCanvas" style="width: 600px; height: 500px"></div>
  </body>
</html>
```

You can [look at this example](https://developers.google.com/books/docs/viewer/examples/book-simple) and download it to edit and play
around with it. Even in this simple example, there are five things to note:

1. We include the API Loader using a `script` tag.
2. We create a `div` element named "viewerCanvas" to hold the viewer.
3. We write a JavaScript function to create a "viewer" object.
4. We load the book using its unique identifier (in this case `ISBN:0738531367`).
5. We use `google.books.setOnLoadCallback` to call `initialize` when the API has fully loaded.

These steps are explained below.

## Loading the Embedded Viewer API

Using the API Loader framework to load the Embedded Viewer API is relatively simple.
It involves the following two steps:

1. Include the API Loader library:

   ```
   <script type="text/javascript" src="https://www.google.com/books/jsapi.js"></script>
   ```
2. Invoke the `google.books.load` method. The `google.books.load` method takes an optional list parameter specifying a callback function or language, as explained [below](https://developers.google.com/books/docs/viewer/developers_guide#Localization).

   ```
   <script type="text/javascript">
     google.books.load();
   </script>
   ```

### Loading a localized version of the Embedded Viewer API

The Embedded Viewer API uses English by default when displaying textual information such as
tooltips, the names for controls, and link text. If you wish to change
the Embedded Viewer API to properly display information in a particular language, you can add an optional
`language` parameter to your `google.books.load` call.

For example, to display a book preview module with the Brazilian Portuguese interface language:

```
<script type="text/javascript">
  google.books.load({"language": "pt-BR"});
</script>
```

[View example (book-language.html)](https://developers.google.com/books/docs/viewer/examples/book-language)

Currently supported [RFC 3066](https://www.ietf.org/rfc/rfc3066.txt) language codes include af, ar, hy, bg, ca, zh-CN, zh-TW, hr, cs, da, nl, en, fil, fi, fr, de, el, he, hu, is, id, it, ja, ko, lv, lt, ms, no, pl, pt-BR, pt-PT, ro, ru, sr, sk, sl, es, sv, tl, th, tr, uk, and vi.

When using the Embedded Viewer API in languages other than English, we strongly recommend serving your page with a `content-type` header set to `utf-8`, or including an equivalent `<meta>` tag in your page. Doing this helps ensure that characters render correctly across all browsers. For more information, see the W3C's page on [setting the HTTP charset parameter](https://www.w3.org/International/O-HTTP-charset).

## Viewer DOM elements

```
<div id="viewerCanvas" style="width: 600px; height: 500px"></div>
```

For a book to display on a web page, one must reserve a spot for it. Commonly, this is done
by creating a named `div` element and obtaining a reference to
this element in the browser's document object model (DOM).

The example above defines a `div` named "viewerCanvas" and sets its size
using style attributes. The viewer implicitly uses the size of the container to size itself.

## The DefaultViewer object

```
var viewer = new google.books.DefaultViewer(document.getElementById('viewerCanvas'));
```

The JavaScript class that creates and controls a single viewer on the page is
the `DefaultViewer` class. (You may create more than one instance of this class - each
object will define a separate viewer on the page.) A new instance of this class is created
using the JavaScript `new` operator.

When you create a new viewer instance, you specify a DOM node in the
page (usually a `div` element) as a container for the viewer. HTML nodes
are children of the JavaScript `document` object, and
we obtain a reference to this element via the `document.getElementById()` method.

This code defines a variable (named `viewer`) and assigns that variable to a new
`DefaultViewer` object. The function `DefaultViewer()` is known as a [*constructor*](https://en.wikipedia.org/wiki/Constructor_(computer_science))
and its definition (condensed for clarity from the [Embedded Viewer API Reference](https://developers.google.com/books/docs/viewer/reference)) is shown below:

| Constructor | Description |
|---|---|
| DefaultViewer(container, opts?) | Creates a new viewer inside the given HTML `*container*`, which should be a [block-level element](https://www.w3.org/TR/html401/struct/global.html#block-inline) on the page (typically a `DIV`). Advanced options are passed using the optional `*opts*` parameter. |

Note that the second parameter in the constructor is optional---intended for advanced implementations beyond the scope of this document---and it is omitted from the "Hello, World" example.

## Initializing the viewer with a specific book

```
  viewer.load('ISBN:0738531367');
```

Once we've created a viewer via the `DefaultViewer` constructor, it needs to be initializes with a particular book. This initialization
is accomplished with use of the viewer's `load()` method. The `load()` method requires an
`identifier` value, which tells the API what book to show. This method **must** be sent before any other operations are performed
on the viewer object.

If you know of multiple identifiers for a book---the ISBN for the paperback edition, or alternate OCLC numbers---you can pass an array of identifier strings as the first parameter to the `load()` function. The viewer will render the book if there is an embeddable preview associated with *any* of identifiers in the array.

### Supported book identifiers

Like the [Dynamic Links](https://developers.google.com/books/docs/dynamic-links#requestFormat) feature, the Embedded Viewer API supports a number of values to identify a particular book. These include:

ISBN
:   The unique 10- or 13-digit commercial [International Standard Book Number](https://en.wikipedia.org/wiki/International_Standard_Book_Number).  
    Example: `ISBN:0738531367`

OCLC number
:   The unique number assigned to a book by the [OCLC](https://oclc.org) when the book's record is added to the [WorldCat](https://www.worldcat.org) cataloging system.  
    Example: `OCLC:70850767`

LCCN
:   The [Library of Congress Control Number](https://en.wikipedia.org/wiki/Library_of_Congress_Control_Number) assigned to the record by the Library of Congress.  
    Example: `LCCN:2006921508`

Google Books volume ID
:   The unique string Google Books has assigned to the volume, which appears in the URL to the book on Google Books.  
    Example: `Py8u3Obs4f4C`

Google Books preview URL
:   A URL that opens a book preview page on Google Books.  
    Example: `https://books.google.com/books?id=Py8u3Obs4f4C&printsec=frontcover`

These identifiers are often used with other APIs in the Google Books API Family. For example, you can use [Dynamic Links](https://developers.google.com/books/docs/dynamic-links) to render a preview button only if the book is embeddable---and then, when the user clicks the button, instantiate a viewer using the [preview URL returned by the Dynamic Links call](https://developers.google.com/books/docs/dynamic-links#JSONformat). Similarly, you can build a rich browse-and-preview application with the [Books API](https://developers.google.com/books/docs/v1/using), which returns several suitable industry identifiers in its Volumes feeds. Visit the [examples page](https://developers.google.com/books/docs/viewer/examples) to peek at some advanced implementations.

### Handling failed initializations

In some cases, the `load` call may fail. Typically this occurs when the API could not find a book associated with the supplied identifier, when there is no preview of the book available, when the book preview cannot be embedded, or when territorial restrictions prevent the end user from seeing this particular book. You may wish to be alerted of such a failure, so your code can handle this condition gracefully. For this reason, the `load` function allows you to pass an optional second parameter, `notFoundCallback`, which indicates what function should be called if the book could not be loaded. For example, the following code will generate a JavaScript "alert" box if the book could be embedded:

```
function alertNotFound() {
  alert("could not embed the book!");
}

function initialize() {
  var viewer = new google.books.DefaultViewer(document.getElementById('viewerCanvas'));
  viewer.load('ISBN:1234', alertNotFound);
}
```

[View example (book-notfound.html)](https://developers.google.com/books/docs/viewer/examples/book-notfound)

Using this callback, you may decide to show a similar error, or you may choose to hide the `viewerCanvas` element completely. The failure callback parameter is optional, and is not included in the "Hello World" example.

**Note** : Because previews may not be available for all books and for all users, it may be useful to know whether a preview is available *before* you even try to load a viewer for it. For example, you may want to show a "Google Preview" button, page, or section in your UI only if a preview will actually be available to the user. You can do this using the [Books API](https://developers.google.com/books/docs/v1/using) or [Dynamic Links](https://developers.google.com/books/docs/dynamic-links), both of which report whether a book will be available for embedding using the viewer.

### Handling successful initializations

It may also be useful to know if and when a book has loaded successfully. For this reason, the `load` function supports an optional third parameter, `successCallback`, which will be executed if and when a book has finished loading.

```
function alertInitialized() {
  alert("book successfully loaded and initialized!");
}

function initialize() {
  var viewer = new google.books.DefaultViewer(document.getElementById('viewerCanvas'));
  viewer.load('ISBN:0738531367', null, alertInitialized);
}
```

[View example (book-success.html)](https://developers.google.com/books/docs/viewer/examples/book-success)

This callback may be useful if, for example, you only want to show certain elements on your page if the viewer has fully rendered.

<br />

## Showing the viewer on load

```
  google.books.setOnLoadCallback(initialize);
```

While an HTML page renders, the document object model (DOM) is built out, and any external images and scripts are received
and incorporated into the `document` object. To ensure that our viewer is only placed on the page after the page has
fully loaded, the `google.books.setOnLoadCallback` function is used to defer execution of the function that constructs the `DefaultViewer` object. Since `setOnLoadCallback` will only call `initialize` when the Embedded Viewer API is loaded and ready to be used, this avoids unpredictable behavior and ensures control of how and when the viewer is drawn.

**Note:** To maximize cross-browser compatibility, it is strongly recommended that you schedule the viewer load using `google.books.setOnLoadCallback` function, rather than using a `onLoad` event on your `<body>` tag.

## Viewer interactions

Now that you have a `DefaultViewer` object, you can interact with it. The basic viewer object looks and behaves a lot
like the viewer you interact with on the Google Books website and comes with a lot of built-in behavior.

But you can also interact with the viewer programmatically. The `DefaultViewer`
object supports a number of methods that alter the preview state directly. For example, the `zoomIn()`, `nextPage()`,
and `highlight()` methods operate on the viewer programmatically, rather than through user interaction.

The following example displays a book preview that automatically "turns" to the next page every 3 seconds. If the next page is in the
visible part of the viewer, then the viewer pans smoothly to the page; if not, the viewer jumps directly to the top of the next page.

```
function nextStep(viewer) {
  window.setTimeout(function() {
    viewer.nextPage();
    nextStep(viewer);
  }, 3000);
}

function initialize() {
  var viewer = new google.books.DefaultViewer(document.getElementById('viewerCanvas'));
  viewer.load('ISBN:0738531367');
  nextStep(viewer);
}

google.books.setOnLoadCallback(initialize);
```

[View example (book-animate.html)](https://developers.google.com/books/docs/viewer/examples/book-animate)

Note that programmatic calls to the viewer will fail or have no effect until the viewer is fully initialized with a particular book. To ensure you only call such functions when the viewer is ready, use the `successCallback` parameter to `viewer.load` as [described above](https://developers.google.com/books/docs/viewer/developers_guide#Handling_successful_initializations).

For information on all the functions supported by the `DefaultViewer` object, see the [Reference Guide](https://developers.google.com/books/docs/viewer/reference).

## Programming notes

Before you start delving into the Embedded Viewer API, you should take note of
the following concerns to ensure your application works smoothly across
its intended platforms.

### Browser compatibility

The Embedded Viewer API supports recent versions of Internet Explorer,
Firefox, and Safari---and usually other Gecko- and WebKit-based browsers such as
[Camino](http://www.camino.org) and
[Google Chrome](https://www.google.com/chrome) as well.

Different applications sometimes require different behaviors for users with incompatible browsers.
The Embedded Viewer API does not have any automatic behavior when it detects an incompatible browser. Most of the
examples in this document do not check for Browser compatibility, nor do they
display an error message for older browsers. Real applications may do something
more friendly with old or incompatible browsers, but such checks are omitted to make the
examples more readable.

Non-trivial applications will inevitably encounter inconsistencies between browsers and
platforms. Sites such as [quirksmode.org](https://www.quirksmode.org), are
also good resources to find workarounds.

### XHTML and quirks mode

We recommend that you use standards-compliant XHTML on pages that contain the viewer. When browsers see the XHTML
`DOCTYPE` at the top of the page, they render the page in "standards compliance mode," which makes
layout and behaviors much more predictable across browsers. Pages without that definition may render in
"[quirks mode](https://en.wikipedia.org/wiki/Quirks_mode)," which can lead to inconsistent layout.

```
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
    "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
```

### A note on the Embedded Viewer API examples

Note that most of the examples in this documentation show only relevant JavaScript code, not the full
HTML file. You can plug the JavaScript code into your own skeleton HTML file, or you can
download the full HTML file for each example by clicking the link after the example.

## Troubleshooting

If your code doesn't seem to be working, here are some approaches
that might help you solve your problems:

- Look for typos. Remember that JavaScript is a case-sensitive language.
- Use a JavaScript debugger. In Firefox, you can use the JavaScript console, the [Venkman Debugger](https://www.mozilla.org/projects/venkman/), or the [Firebug add-on](https://addons.mozilla.org/en-US/firefox/addon/1843). In IE, you can use the [Microsoft Script Debugger](https://msdn.microsoft.com/library/default.asp?url=/library/en-us/sdbug/Html/sdbug_17.asp). The Google Chrome browser comes with [a number of development tools](https://www.google.com/support/chrome/bin/answer.py?answer=95691&query=chrome+debug&topic&type) built right in, including a DOM inspector and a Javascript debugger.