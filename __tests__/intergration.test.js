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
});

describe("GET: /api/articles/:article_id", () => {
  test("200: responds with the specified article", () => {
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.article_id).toBe(3);
        expect(article).toHaveProperty("author");
        expect(article).toHaveProperty("title");
        expect(article).toHaveProperty("article_id");
        expect(article).toHaveProperty("body");
        expect(article).toHaveProperty("topic");
        expect(article).toHaveProperty("created_at");
        expect(article).toHaveProperty("votes");
        expect(article).toHaveProperty("article_img_url");
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
  test("200: successfully adds new comment to article and returns the posted comment", () => {
    const newComment = {
      username: "butter_bridge",
      body: "A brand new comment!",
    };
    return request(app)
      .post("/api/articles/5/comments")
      .send(newComment)
      .expect(201)
      .then(({ body: { newComment } }) => {
        expect(newComment).toHaveLength(1);
        expect(newComment).toMatchObject(newComment);
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
  test("400: sends an appropriate message and status when passed a non-valid user", () => {
    const malformedBody = {
      username: "dont_exist",
      body: "A brand new comment!",
    };
    return request(app)
      .post("/api/articles/5/comments")
      .send(malformedBody)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request - Error");
      });
  });
  test("400: sends appropriate message and status when article id does not exist in article table", () => {
    const newComment = {
      username: "butter_bridge",
      body: "A brand new comment again!",
    };
    return request(app)
      .post("/api/articles/99999999/comments")
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Bad request - Error");
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
