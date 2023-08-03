import { posts } from "./data";
import { createStore, createRelationalObject } from "./model";
import { JoinOptions } from "./types";

const user = createRelationalObject("user", { id: "number" });
const image = createRelationalObject("image", { id: "number" });
const thumbnail = createRelationalObject("thumbnail", { id: "number" });
const post = createRelationalObject("post", { id: "number" });

image.hasMany(thumbnail, "thumbnails")
user.hasOne(image, "profileImage")
post.hasMany(image, "images")
post.hasOne(user)
user.hasMany(post, "posts")
image.hasOne(user, "user")
image.hasOne(post, "post")

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

type User = { id: number; username: string }
type Image = { id: number; baseScale: number; thumbnails: Thumbnail[] }
type Thumbnail = { id: number; height: number; widht: number; uri: string; }

const result = store.select<"user", User>({
  from: "user",
  fields: "*",
  where: { id: 1 },
  join: [
    {
      on: "profileImage",
      fields: ["id", "thumbnails"],
      join: [
        { on: "thumbnails", fields: ["height"] }
      ]
    } as JoinOptions<Image>
  ],
})

console.log(result)