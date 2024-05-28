const db = require("../db/connection");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const request = require("supertest");
const app = require("../app");

beforeEach(() => seed(data));
afterAll(() => db.end());

//__________________ Section: /api _______________//
describe("GET: /api", () => {
  test("200: responds with a list of api endpoints available", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { api_endpoints } }) => {
        const parsedData = JSON.parse(api_endpoints);
        const cleanEndpoints = Object.values(parsedData).slice(1);
        cleanEndpoints.forEach((endpoint) => {
          expect(endpoint).toHaveProperty("description");
          expect(endpoint).toHaveProperty("queries");
          expect(endpoint).toHaveProperty("exampleResponse");
        });
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
describe("GET: /api/articles/:article_id", () => {
  test("200: responds with the specified article", () => {
    const responseExpected = {
      title: "Eight pug gifs that remind me of mitch",
      topic: "mitch",
      author: "icellusedkars",
      body: "some gifs",
      created_at: "2020-11-03T09:12:00.000Z",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .get("/api/articles/3")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toHaveProperty("author");
        expect(article).toHaveProperty("title");
        expect(article).toHaveProperty("article_id");
        expect(article).toHaveProperty("body");
        expect(article).toHaveProperty("topic");
        expect(article).toHaveProperty("created_at");
        expect(article).toHaveProperty("votes");
        expect(article).toHaveProperty("article_img_url");
        expect(article).toMatchObject(responseExpected);
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
