import { posts } from "./data.js";
import { createStore, createRelationalObject, createRelationalObjectIndex } from "./lib/index.js";

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

const homeFeed = createRelationalObjectIndex("homeFeed", [post])
const users = createRelationalObjectIndex("users", [user])

const store = createStore({
  relationalCreators: [user, post, image, thumbnail],
  indexes: [homeFeed, users],
  identifier: {
    'user': o => !!o.username,
    'image': o => !!o.baseScale,
    'thumbnail': o => !!o.uri,
    'post': o => !!o.caption,
  }
});

store.upsert([...posts, ...posts], { indexes: ["homeFeed"] })
store.upsert({ id: 3, username: "John" })

type User = { id: number; username: string }
type Image = { id: number; baseScale: number; thumbnails: Thumbnail[] }
type Thumbnail = { id: number; height: number; widht: number; uri: string; }

const result = store.select<"post", any>({
  from: "post",
  fields: ["id", "images"],
  where: { id: 10 },
  join: [
    {
      on: "images",
      fields: ["id", "thumbnails"],
      join: [
        { on: "thumbnails", fields: ["height"] }
      ]
    }
  ],
})

// const selected = store.selectIndex("homeFeed")

// console.log(selected)

store.upsert({ id: 5, caption: "Hey there" }, { indexes: ["homeFeed"] })

const selected2 = store.selectIndex("homeFeed", {
  post: {
    from: "post",
    fields: ["id"],
  }
})

console.log(selected2)
