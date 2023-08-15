import { posts } from "./data";
import { createStore, createRelationalObject, createRelationalObjectIndex } from "./lib/index";

const user = createRelationalObject("user", { id: "number" });
const image = createRelationalObject("image", { id: "number" });
const thumbnail = createRelationalObject("thumbnail", { id: "number" });
const post = createRelationalObject("post", { id: "number" });

image.hasMany(thumbnail, "thumbnails")
user.hasOne(image, "profileImage")
post.hasMany(image, "images")
post.hasOne(user)
user.hasMany(post, "posts")
image.hasOne(user)
image.hasOne(post)

const homeFeed = createRelationalObjectIndex("homeFeed", [post, user], (a,b) => -1)
const users = createRelationalObjectIndex("users", [user])

const store = createStore({
  relationalCreators: [user, post, image, thumbnail],
  indexes: [homeFeed, users],
  identifier: {
    'user': o => "username" in o,
    'image': o => "baseScale" in o,
    'thumbnail': o => "uri" in o,
    'post': o => "caption" in o,
  }
});

store.upsert([...posts, ...posts], { indexes: [{ index: "homeFeed", key: "1" }] })

// store.upsert({ id: 3, username: "John" })

// type User = { id: number; username: string }
// type Image = { id: number; baseScale: number; thumbnails: Thumbnail[] }
// type Thumbnail = { id: number; height: number; widht: number; uri: string; }

const result = store.select<"post", any>({
  from: "post",
  fields: "*",
  where: { id: 10 },
  join: [
    {
      on: "user",
      fields: "*",
    }
  ],
})

console.log(result)

// const selected = store.selectIndex("homeFeed")

// console.log(selected)

// store.upsert({ id: 5, caption: "Hey there" }, { indexes: [{ index: "homeFeed", key: "2" }] })

// const selected2 = store.selectIndex("homeFeed-1", {
//   post: {
//     from: "post",
//     fields: ["id"],
//   },
//   user: {
//     from:"user",
//     fields: ["id"]
//   }
// })

