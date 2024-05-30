const db = require("../db/connection");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const request = require("supertest");
const app = require("../app");
const endpointsFile = require("../endpoints.json");

beforeEach(() => seed(data));
afterAll(() => db.end());

//__________________ Section: /api _______________//
describe("GET: /api", () => {
  test("200: responds with a list of api endpoints available", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body).toMatchObject(endpointsFile);
      });
  });
});

//__________________ Section: /api/topics _______________//
describe("GET: /api/topics", () => {
  test("200: responds with a list of topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
        });
      });
  });
});

//__________________ Section: /api/articles _______________//

describe("GET: /api/articles", () => {
  test("200: responds with an array of all articles as objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(13);
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
        });
        articles.forEach((article) => {
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("comment_count");
          expect(article).not.toHaveProperty("body");
        });
      });
  });
  test("200: responds with array of articles filtered by given topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(12);
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("200: responds with array of articles filtered by multiple given topics", () => {
    const acceptedCategories = ["mitch", "cats"];
    return request(app)
      .get("/api/articles?topic=mitch&topic=cats")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(13);
        articles.forEach((article) => {
          expect(acceptedCategories).toContain(article.topic);
        });
      });
  });
  test("200: returns articles with selected topic ignoring anything else on query", () => {
    return request(app)
      .get("/api/articles?category=computer&topic=mitch")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(12);
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("404: sends appropriate msg and status when topic does not exist", () => {
    return request(app)
      .get("/api/articles?topic=something")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Topic Not Found");
      });
  });
  test("200: resolves with list of articles sorted by valid column DESC", () => {
    return request(app)
      .get("/api/articles?sort_by=author")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("author", {
          descending: true,
        });
      });
  });
  test("200: resolves with list of articles sorted by valid column DESC ignoring other queries", () => {
    return request(app)
      .get("/api/articles?sort_by=author&computer=windows")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("author", {
          descending: true,
        });
      });
  });
  test("400: sends appropriate message and status when passed invalid column on sort_by", () => {
    return request(app)
      .get("/api/articles?sort_by=doesnt_exist")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request - invalid query");
      });
  });
  test("400: sends appropriate message and status when passed multiple sort_by's", () => {
    return request(app)
      .get("/api/articles?sort_by=author&sort_by=author_id")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request - invalid query");
      });
  });
  test("200: resolves with list of articles ordered by valid option", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", {
          descending: false,
        });
      });
  });
  test("200: resolves with list of articles ordered by valid option ignoring other queries", () => {
    return request(app)
      .get("/api/articles?order=asc&computer=mac")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", {
          descending: false,
        });
      });
  });
  test("400: sends appropriate message and status when passed invalid option on order", () => {
    return request(app)
      .get("/api/articles?order=doesnt_exist")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request - invalid query");
      });
  });
  test("400: sends appropriate message and status when passed multiple order queries", () => {
    return request(app)
      .get("/api/articles?order=asc&order=desc")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request - invalid query");
      });
  });
  test("200: resolves with list of articles sorted by valid column and ordered by valid option", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id&order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("article_id", {
          descending: false,
        });
      });
  });
  test("200: resolves with list of articles when passed valid topic,sort_by and order queries", () => {
    return request(app)
      .get("/api/articles?topic=mitch&sort_by=article_id&order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("article_id", {
          descending: false,
        });
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("200: returns 10 articles for page 1 with total count of articles", () => {
    return request(app)
      .get("/api/articles?page=1")
      .expect(200)
      .then(({ body: { articles, total_count } }) => {
        expect(articles[0].article_id).toBe(3);
        expect(articles).toHaveLength(10);
        expect(total_count).toBe("13");
      });
  });
  test("200: returns 10 articles for page 2 offset by 10 with total count of articles", () => {
    return request(app)
      .get("/api/articles?page=2")
      .expect(200)
      .then(({ body: { articles, total_count } }) => {
        expect(articles[0].article_id).toBe(8);
        expect(articles).toHaveLength(3);
        expect(total_count).toBe("13");
      });
  });
  test("400: returns msg and status when passed page option is NaN", () => {
    return request(app)
      .get("/api/articles?page=not-a-number")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request - invalid query");
      });
  });
  test("200: returns articles limited by given query with total count of articles", () => {
    return request(app)
      .get("/api/articles?limit=3")
      .expect(200)
      .then(({ body: { articles, total_count } }) => {
        expect(articles[0].article_id).toBe(3);
        expect(articles).toHaveLength(3);
        expect(total_count).toBe("13");
      });
  });
  test("400: returns msg and status when passed limit option is NaN", () => {
    return request(app)
      .get("/api/articles?limit=not-a-number")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request - invalid query");
      });
  });
  test("200: returns articles for page 1 limited by query given with total count of articles", () => {
    return request(app)
      .get("/api/articles?page=1&limit=3")
      .expect(200)
      .then(({ body: { articles, total_count } }) => {
        expect(articles[0].article_id).toBe(3);
        expect(articles).toHaveLength(3);
        expect(total_count).toBe("13");
      });
  });
  test("200: returns 3 articles for page 2 offset by limit given with total count of articles", () => {
    return request(app)
      .get("/api/articles?page=2&limit=3")
      .expect(200)
      .then(({ body: { articles, total_count } }) => {
        expect(articles[0].article_id).toBe(13);
        expect(articles).toHaveLength(3);
        expect(total_count).toBe("13");
      });
  });
  test("200: returns articles for page 2 offset by limit given with filtered queries with total count of articles", () => {
    return request(app)
      .get(
        "/api/articles?page=2&limit=3&topic=mitch&sort_by=article_id&order=asc"
      )
      .expect(200)
      .then(({ body: { articles, total_count } }) => {
        expect(articles).toBeSortedBy("article_id", { descending: false });
        expect(articles[0].article_id).toBe(4);
        expect(articles).toHaveLength(3);
        expect(total_count).toBe("13");
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("200: returns articles for page 2 offset by limit given with filtered queries with total count of articles ignoring other queries", () => {
    return request(app)
      .get(
        "/api/articles?page=2&limit=3&topic=mitch&sort_by=article_id&order=asc&computer=mac"
      )
      .expect(200)
      .then(({ body: { articles, total_count } }) => {
        expect(articles).toBeSortedBy("article_id", { descending: false });
        expect(articles[0].article_id).toBe(4);
        expect(articles).toHaveLength(3);
        expect(total_count).toBe("13");
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });
  test("404: sends msg and status when passed complex query with unknown topic", () => {
    return request(app)
      .get(
        "/api/articles?page=2&limit=3&topic=idontexist&sort_by=article_id&order=asc"
      )
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Topic Not Found");
      });
  });
  test("400: sends msg and status when passed complex query with invalid order", () => {
    return request(app)
      .get(
        "/api/articles?page=2&limit=3&topic=mitch&sort_by=article_id&order=idontexist"
      )
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request - invalid query");
      });
  });
  test("400: sends msg and status when passed complex query with invalid sort_by", () => {
    return request(app)
      .get(
        "/api/articles?page=2&limit=3&topic=mitch&sort_by=idontexist&order=asc"
      )
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request - invalid query");
      });
  });
});

describe("POST: /api/articles", () => {
  test("201: returns the newly posted article when article img is passed", () => {
    const newArticle = {
      author: "icellusedkars",
      title: "The dogs bananas",
      body: "some text here",
      topic: "paper",
      article_img_url:
        "https://www.pexels.com/photo/black-and-white-border-collie-sitting-on-brown-wicker-armchair-7678420/",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body: { newArticle } }) => {
        expect(newArticle.article_id).toBe(14);
        expect(newArticle).toHaveProperty("author");
        expect(newArticle).toHaveProperty("title");
        expect(newArticle).toHaveProperty("article_id");
        expect(newArticle).toHaveProperty("topic");
        expect(newArticle).toHaveProperty("created_at");
        expect(newArticle).toHaveProperty("votes");
        expect(newArticle).toHaveProperty("article_img_url");
        expect(newArticle).toHaveProperty("comment_count");
        expect(newArticle).toHaveProperty("body");
      });
  });
  test("201: returns the newly posted article with img_url using default image", () => {
    const newArticle = {
      author: "icellusedkars",
      title: "The dogs bananas",
      body: "some text here",
      topic: "paper",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body: { newArticle } }) => {
        expect(newArticle.article_id).toBe(14);
        expect(newArticle.article_img_url).toBe(
          "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700"
        );
      });
  });
  test("201: returns newly created article which ignores extra parts of the body not needed", () => {
    const newArticle = {
      author: "icellusedkars",
      title: "a new article title is here",
      body: "some text here",
      topic: "paper",
      something_else: 234,
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body: { newArticle } }) => {
        expect(newArticle.article_id).toBe(14);
        expect(newArticle).not.toHaveProperty("something_else");
      });
  });
  test("201: returns newly created article and does NOT update votes column in table", () => {
    const newArticle = {
      author: "icellusedkars",
      title: "a new article title is here",
      body: "some text here",
      topic: "paper",
      votes: 234,
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body: { newArticle } }) => {
        expect(newArticle.article_id).toBe(14);
        expect(newArticle.votes).toBe(0);
      });
  });
  test("404: sends appropriate msg and status when passed an author that doesnt exist", () => {
    const newArticle = {
      author: "idontexist",
      title: "a new article title is here",
      body: "some text here",
      topic: "paper",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Error Not Found");
      });
  });
  test("404: sends appropriate msg and status when passed an author that doesnt exist", () => {
    const newArticle = {
      author: "icellusedkars",
      title: "a new article title is here",
      body: "some text here",
      topic: "idontexist",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Error Not Found");
      });
  });
});

describe("GET: /api/articles/:article_id", () => {
  test("200: responds with the specified article", () => {
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.article_id).toBe(3);
        expect(article.comment_count).toBe("2");
        expect(article).toHaveProperty("author");
        expect(article).toHaveProperty("title");
        expect(article).toHaveProperty("article_id");
        expect(article).toHaveProperty("body");
        expect(article).toHaveProperty("topic");
        expect(article).toHaveProperty("created_at");
        expect(article).toHaveProperty("votes");
        expect(article).toHaveProperty("article_img_url");
        expect(article).toHaveProperty("comment_count");
      });
  });
  test("404: sends appropriate status and msg when id does not exists", () => {
    return request(app)
      .get("/api/articles/9999999")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article not found");
      });
  });
  test("400: sends appropriate status and msg when id passed is not a number", () => {
    return request(app)
      .get("/api/articles/not-a-number")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});

describe("PATCH: /api/articles/:article_id", () => {
  test("200: successfully increments votes on given article and returns updated article", () => {
    const expectedArticle = {
      article_id: 3,
      title: "Eight pug gifs that remind me of mitch",
      topic: "mitch",
      author: "icellusedkars",
      body: "some gifs",
      created_at: "2020-11-03T09:12:00.000Z",
      votes: 1,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    const incrementVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/3")
      .send(incrementVotes)
      .expect(200)
      .then(({ body: { updatedArticle } }) => {
        expect(updatedArticle).toMatchObject(expectedArticle);
      });
  });
  test("200: successfully decrements votes on given article and returns updated article", () => {
    const expectedArticle = {
      article_id: 1,
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      created_at: "2020-07-09T20:11:00.000Z",
      votes: 90,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    const decrementVotes = { inc_votes: -10 };
    return request(app)
      .patch("/api/articles/1")
      .send(decrementVotes)
      .expect(200)
      .then(({ body: { updatedArticle } }) => {
        expect(updatedArticle).toMatchObject(expectedArticle);
      });
  });
  test("404: sends appropriate message and status when article id does not exists", () => {
    const incrementVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/99999")
      .send(incrementVotes)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article not found");
      });
  });
  test("400: sends appropriate message and status when passed invalid endpoint", () => {
    const incrementVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/banana")
      .send(incrementVotes)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  test("400: sends appropriate message and status when passed a malformed body", () => {
    const incrementVotes = { inc_votes: "not a number" };
    return request(app)
      .patch("/api/articles/1")
      .send(incrementVotes)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  test("400: sends appropriate message and status when passed an invalid key", () => {
    const incrementVotes = { votes: 5 };
    return request(app)
      .patch("/api/articles/1")
      .send(incrementVotes)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request - Malformed Body");
      });
  });
});

//__________________ Section: /api/articles/:article_id/comments _______________//
describe("GET: /api/articles/:article_id/comments", () => {
  test("200: responds with an array of comments for specified article", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { articleComments } }) => {
        expect(articleComments).toBeSortedBy("created_at", {
          descending: true,
        });
        expect(articleComments).toHaveLength(11);
        articleComments.forEach((comment) => {
          expect(comment.article_id).toBe(1);
          expect(comment).toHaveProperty("comment_id");
          expect(comment).toHaveProperty("votes");
          expect(comment).toHaveProperty("created_at");
          expect(comment).toHaveProperty("author");
          expect(comment).toHaveProperty("body");
          expect(comment).toHaveProperty("article_id");
        });
      });
  });
  test("200: returns an empty array when article has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body: { articleComments } }) => {
        expect(articleComments).toHaveLength(0);
      });
  });
  test("404: sends appropriate message and status when article id does not exists", () => {
    return request(app)
      .get("/api/articles/9999999/comments")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Not found");
      });
  });
  test("400: sends appropriate message and status when article id passed is not a number", () => {
    return request(app)
      .get("/api/articles/not-a-number/comments")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});

describe("POST: /api/articles/:article_id/comments", () => {
  test("201: successfully adds new comment to article and returns the posted comment", () => {
    const newComment = {
      username: "butter_bridge",
      body: "A brand new comment!",
    };
    return request(app)
      .post("/api/articles/5/comments")
      .send(newComment)
      .expect(201)
      .then(({ body: { newComment } }) => {
        expect(newComment.article_id).toBe(5);
        expect(newComment).toHaveProperty("comment_id");
        expect(newComment).toHaveProperty("body");
        expect(newComment).toHaveProperty("article_id");
        expect(newComment).toHaveProperty("author");
        expect(newComment).toHaveProperty("votes");
        expect(newComment).toHaveProperty("created_at");
      });
  });
  test("201: successfully adds new comment to article and returns comment ignoring irrelevant keys/values on body", () => {
    const newComment = {
      username: "butter_bridge",
      body: "A brand new comment!",
      likes: 1000,
    };
    return request(app)
      .post("/api/articles/6/comments")
      .send(newComment)
      .expect(201)
      .then(({ body: { newComment } }) => {
        expect(newComment.article_id).toBe(6);
        expect(newComment).not.toHaveProperty("likes");
      });
  });
  test("400: sends an appropriate message and status when passed a invalid id format", () => {
    const newComment = {
      username: "butter_bridge",
      body: "great comment",
    };
    return request(app)
      .post("/api/articles/not-a-number/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("404: sends appropriate message and status when article id does not exist in article table", () => {
    const newComment = {
      username: "butter_bridge",
      body: "A brand new comment again!",
    };
    return request(app)
      .post("/api/articles/99999999/comments")
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Error Not Found");
      });
  });
  test("400: sends an appropriate message and status when passed a malformed body", () => {
    const malformedBody = {
      username: "butter_bridge",
      msg: 5,
    };
    return request(app)
      .post("/api/articles/5/comments")
      .send(malformedBody)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("404: sends an appropriate message and status when passed a non-valid user", () => {
    const newComment = {
      username: "dont_exist",
      body: "A brand new comment!",
    };
    return request(app)
      .post("/api/articles/5/comments")
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Error Not Found");
      });
  });
});

describe("DELETE: /api/comments/:comment_id", () => {
  test("204: responds with no content and successfully deletes comment", () => {
    return request(app).delete("/api/comments/2").expect(204);
  });
  test("404: sends appropriate message and status when comment id doesnt exist", () => {
    return request(app)
      .delete("/api/comments/99999999")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Article not found");
      });
  });
  test("400: sends appropriate message and status when passed malformed request", () => {
    return request(app)
      .delete("/api/comments/not-a-number")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});

describe("PATCH: /api/comments/:comment_id", () => {
  test("200: successfully increments comment votes and returns comment", () => {
    const expectedComment = {
      comment_id: 3,
      body: "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.",
      votes: 101,
      author: "icellusedkars",
      article_id: 1,
      created_at: "2020-03-01T01:13:00.000Z",
    };
    const incrementVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/comments/3")
      .send(incrementVotes)
      .expect(200)
      .then(({ body: { updatedComment } }) => {
        expect(updatedComment.comment_id).toBe(3);
        expect(updatedComment).toMatchObject(expectedComment);
      });
  });
  test("200: successfully decreases comment votes and returns comment", () => {
    const expectedComment = {
      comment_id: 3,
      body: "Replacing the quiet elegance of the dark suit and tie with the casual indifference of these muted earth tones is a form of fashion suicide, but, uh, call me crazy — onyou it works.",
      votes: 99,
      author: "icellusedkars",
      article_id: 1,
      created_at: "2020-03-01T01:13:00.000Z",
    };
    const decreaseVotes = { inc_votes: -1 };
    return request(app)
      .patch("/api/comments/3")
      .send(decreaseVotes)
      .expect(200)
      .then(({ body: { updatedComment } }) => {
        expect(updatedComment.comment_id).toBe(3);
        expect(updatedComment).toMatchObject(expectedComment);
      });
  });
  test("404: returns msg and status when comment_id does not exist", () => {
    const incrementVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/comments/9999999")
      .send(incrementVotes)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Comment not found");
      });
  });
  test("400: returns msg and status when passed wrong ID format", () => {
    const incrementVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/comments/not-a-number")
      .send(incrementVotes)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  test("400: returns msg and status when passed malformed body", () => {
    const incrementVotes = { inc_votes: "one hundred" };
    return request(app)
      .patch("/api/comments/1")
      .send(incrementVotes)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
  test("400: returns msg and status when passed incorrect votes key", () => {
    const incrementVotes = { votes: 5 };
    return request(app)
      .patch("/api/comments/1")
      .send(incrementVotes)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request");
      });
  });
});

//__________________ Section: /api/users _______________//
describe("GET: /api/users", () => {
  test("200: resolves with a list of all users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toHaveProperty("username");
          expect(user).toHaveProperty("name");
          expect(user).toHaveProperty("avatar_url");
        });
      });
  });
});

describe("GET: /api/users/:username", () => {
  test("200: returns user by specified username passed", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user.username).toBe("butter_bridge");
        expect(user).toHaveProperty("avatar_url");
        expect(user).toHaveProperty("name");
      });
  });
  test("404: sends msg and status when user not found", () => {
    return request(app)
      .get("/api/users/i_dont_exists_lala")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("User not found");
      });
  });
});

//__________________ 404 Wildcard Testing _______________//
describe("404 For Non found paths", () => {
  test("404: send 404 message and status when path is not found", () => {
    return request(app)
      .get("/api/something-not-here")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Route not found");
      });
  });
});
