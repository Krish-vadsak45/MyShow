import test, { after } from "node:test";
import assert from "node:assert/strict";

import Booking from "../models/booking.model.js";
import Movie from "../models/movie.model.js";
import Show from "../models/show.model.js";
import redis from "../config/redis.js";
import { clerkClient } from "@clerk/express";
import { getUserBookings } from "../controllers/userControllers.js";
import { getPersonalizedRecommendations } from "../controllers/recommendationController.js";
import { getShow, formatDateKey } from "../controllers/showControllers.js";
import { lockSeats, unlockSeats } from "../controllers/bookingControllers.js";
import { inngest } from "../inngest/index.js";

const userApiPrototype = Object.getPrototypeOf(clerkClient.users);

const originalFns = {
  bookingFind: Booking.find,
  movieFind: Movie.find,
  movieFindById: Movie.findById,
  showFind: Show.find,
  redisGet: redis.get,
  redisSet: redis.set,
  redisDel: redis.del,
  redisEval: redis.eval,
  clerkGetUser: userApiPrototype.getUser,
  inngestSend: inngest.send,
};

const createResponse = () => {
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
};

const resetMocks = () => {
  Booking.find = originalFns.bookingFind;
  Movie.find = originalFns.movieFind;
  Movie.findById = originalFns.movieFindById;
  Show.find = originalFns.showFind;
  redis.get = originalFns.redisGet;
  redis.set = originalFns.redisSet;
  redis.del = originalFns.redisDel;
  redis.eval = originalFns.redisEval;
  userApiPrototype.getUser = originalFns.clerkGetUser;
  inngest.send = originalFns.inngestSend;
};

after(async () => {
  resetMocks();
  redis.disconnect();
});

test("getUserBookings returns full booking history including past shows", async () => {
  const pastBooking = {
    _id: "past-booking",
    show: { showDateTime: new Date("2025-01-01T12:00:00.000Z") },
  };
  const futureBooking = {
    _id: "future-booking",
    show: { showDateTime: new Date("2030-01-01T12:00:00.000Z") },
  };

  redis.get = async () => null;
  redis.set = async () => "OK";
  Booking.find = () => ({
    populate: async () => [pastBooking, futureBooking],
  });

  const req = { userId: "user-123" };
  const res = createResponse();

  await getUserBookings(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.deepEqual(res.body.bookings, [pastBooking, futureBooking]);

  resetMocks();
});

test("getPersonalizedRecommendations uses vote_average and release_date for cold start fallback", async () => {
  const shownMovieIds = ["movie-a", "movie-b"];
  const fallbackMovies = [{ _id: "movie-b" }, { _id: "movie-a" }];
  let sortArg;
  let limitArg;

  redis.get = async () => null;
  redis.set = async () => "OK";
  Booking.find = () => ({
    populate: async () => [],
  });
  userApiPrototype.getUser = async () => ({ privateMetadata: {} });
  Show.find = () => ({
    populate: async () => [
      { movie: { _id: "movie-a" } },
      { movie: { _id: "movie-b" } },
    ],
  });
  Movie.find = (query) => {
    assert.deepEqual(query, { _id: { $in: shownMovieIds } });
    return {
      sort(value) {
        sortArg = value;
        return this;
      },
      limit(value) {
        limitArg = value;
        return Promise.resolve(fallbackMovies);
      },
    };
  };

  const req = { user: { id: "user-123" } };
  const res = createResponse();

  await getPersonalizedRecommendations(req, res);

  assert.deepEqual(sortArg, { vote_average: -1, release_date: -1 });
  assert.equal(limitArg, 10);
  assert.equal(res.body.success, true);
  assert.deepEqual(res.body.recommended, fallbackMovies);

  resetMocks();
});

test("getShow groups showtimes by local calendar day instead of UTC date", async () => {
  redis.get = async () => null;
  redis.set = async (...args) => {
    if (args[0] === "lock:show:detail:123") return "OK";
    return "OK";
  };
  redis.del = async () => 1;
  Show.find = async () => [
    {
      _id: "show-1",
      showDateTime: new Date(2026, 3, 26, 23, 30),
    },
    {
      _id: "show-2",
      showDateTime: new Date(2026, 3, 27, 0, 15),
    },
  ];
  Movie.findById = async () => ({ _id: "123", title: "Late Show" });

  const req = { params: { movieId: "123" } };
  const res = createResponse();

  await getShow(req, res);

  assert.equal(res.body.success, true);
  assert.deepEqual(Object.keys(res.body.dateTime), ["2026-04-26", "2026-04-27"]);
  assert.equal(formatDateKey(new Date(2026, 3, 26, 23, 30)), "2026-04-26");

  resetMocks();
});

test("lockSeats acquires a Redis seat lock and returns a lock token", async () => {
  let keyUsed;
  let ttlUsed;

  redis.set = async (key, value, exKeyword, ttl, nxKeyword) => {
    keyUsed = key;
    ttlUsed = [exKeyword, ttl, nxKeyword];
    assert.match(value, /^user-123:\d+$/);
    return "OK";
  };

  const req = {
    userId: "user-123",
    body: { showId: "507f1f77bcf86cd799439011", seatId: "A1" },
  };
  const res = createResponse();

  await lockSeats(req, res);

  assert.equal(res.body.success, true);
  assert.match(res.body.lockToken, /^user-123:\d+$/);
  assert.equal(keyUsed, "seat:507f1f77bcf86cd799439011:A1");
  assert.deepEqual(ttlUsed, ["EX", 300, "NX"]);

  resetMocks();
});

test("unlockSeats requires a lock token", async () => {
  const req = {
    body: { showId: "507f1f77bcf86cd799439011", seatId: "A1" },
  };
  const res = createResponse();

  await unlockSeats(req, res);

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    success: false,
    message: "lockToken is required for unlocking",
  });

  resetMocks();
});
