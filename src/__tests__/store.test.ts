import { posts } from "../data.js";
import { createRelationalObject, createStore } from "../lib/index.js";
import v8 from "v8";

function getObjectMemoryUsageInMB(object: any) {
  const sizeInBytes = v8.serialize(object).byteLength;
  return sizeInBytes / (1024 * 1024);
}

const user = createRelationalObject("user", { id: "number" });
const image = createRelationalObject("image", { id: "number" });
const thumbnail = createRelationalObject("thumbnail", { id: "number" });
const post = createRelationalObject("post", { id: "number" });

image.hasMany(thumbnail, "thumbnails")
user.hasOne(image, "profileImage")
post.hasMany(image, "images")
post.hasOne(user)

const store = createStore({
  relationalCreators: [user, post, image, thumbnail],
  identifier: {
    'user': o => !!o.username,
    'image': o => !!o.baseScale,
    'thumbnail': o => !!o.uri,
    'post': o => !!o.caption,
  }
});

store.upsert(posts)


test('1. Related fields should also change', () => {


  const v1 = store.getState().user[2].profileImage.thumbnails[0].height;
  const v2 = store.getState().thumbnail[186].height;

  expect(v1).toBe(256)
  expect(v2).toBe(256)

  store.getState().user[2].profileImage.thumbnails[0].height = "Hello"

  const v3 = store.getState().user[2].profileImage.thumbnails[0].height;
  const v4 = store.getState().thumbnail[186].height;

  expect(v3).toBe("Hello")
  expect(v4).toBe("Hello")
})


test('2. Related fields should also change', () => {

  const v1 = store.getState().user[2].username;
  const v2 = store.getState().post[10].user.username;

  expect(v1).toBe("qwerty")
  expect(v2).toBe("qwerty")

  store.getState().user[2].username = "--updated"

  const v3 = store.getState().user[2].username;
  const v4 = store.getState().post[10].user.username;

  expect(v3).toBe("--updated")
  expect(v4).toBe("--updated")

  store.getState().post[9].user.username = "--updated-once-again"

  const v5 = store.getState().user[2].username;
  const v6 = store.getState().post[10].user.username;

  expect(v5).toBe("--updated-once-again")
  expect(v6).toBe("--updated-once-again")
})


test("Memory should not increase when the same object is passed twice", () => {

  store.upsert(posts)

  const memoryBefore = getObjectMemoryUsageInMB(store.getState());

  store.upsert([...posts, ...posts, ...posts, ...posts, ...posts, ...posts])

  const memoryAfter = getObjectMemoryUsageInMB(store.getState());

  expect(memoryBefore).toBe(memoryAfter)
})

test("Memory should not increase when we add more relationships", () => {

  const store1 = createStore({
    relationalCreators: [user, post, image, thumbnail],
    identifier: {
      'user': o => !!o.username,
      'image': o => !!o.baseScale,
      'thumbnail': o => !!o.uri,
      'post': o => !!o.caption,
    }
  });

  store1.upsert(posts)

  const memoryStore1 = getObjectMemoryUsageInMB(store1.getState());

  user.hasMany(post, "posts")
  image.hasOne(user, "user")

  const store2 = createStore({
    relationalCreators: [user, post, image, thumbnail],
    identifier: {
      'user': o => !!o.username,
      'image': o => !!o.baseScale,
      'thumbnail': o => !!o.uri,
      'post': o => !!o.caption,
    }
  });

  store2.upsert(posts)

  const memoryStore2 = getObjectMemoryUsageInMB(store2.getState());

  // Increased very slightly because of an additional field and a few extra references
  expect(memoryStore2).toBe(memoryStore1 + 0.0000476837158203125)
})