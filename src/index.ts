import { posts } from "./data";
import { createStore, createRelationalObject } from "./model";

const user = createRelationalObject("user", {id: "number"});
const image = createRelationalObject("image", {id: "number"});
const thumbnail = createRelationalObject("thumbnail", {id: "number"});
const post = createRelationalObject("post", {id: "number"});

image.hasMany(thumbnail, "thumbnails")
user.hasOne(image, "profileImage")
post.hasMany(image, "images")
post.hasOne(user)
user.hasMany(post, "posts")
image.hasOne(user,"user")
image.hasOne(post,"post")

const store = createStore({
  relationalCreators: [user, post, image, thumbnail],
  identifier: {
    'user': o => !!o.username,
    'image': o => !!o.baseScale,
    'thumbnail': o => !!o.uri,
    'post': o => !!o.caption,
  }
});

//@ts-ignore
// console.log(store.model.user.__relationship)
// store.upsert([...posts, ...posts, ...posts, ...posts, ...posts, ...posts])
store.upsert(posts)

console.log(store.state.post[10].images[0].post)