import { posts } from "./data";
import { createStore, createRelationalObject, createRelationalObjectIndex } from "./lib/index";


const user = createRelationalObject("user", { id: "number" })
const image = createRelationalObject("image", { id: "number" })
const imageThumbnail = createRelationalObject("thumbnail", { id: "number" })
const post = createRelationalObject("post", { id: "number" })
const postComment = createRelationalObject("postComment", { id: "number" })

const profilePosts = createRelationalObjectIndex("profilePosts", [post])
const homeFeed = createRelationalObjectIndex("homeFeed", [post])
const postComments = createRelationalObjectIndex("postComments", [postComment], (a, b) => a.id > b.id ? -1 : 1)

postComment.hasMany(postComment, "replies")
postComment.hasOne(postComment, "replyingTo")
postComment.hasOne(post)
postComment.hasOne(user)

post.hasOne(user)
post.hasMany(image, "images")

user.hasOne(image, "profileImage")
user.hasOne(image, "bannerImage")
user.hasOne(image, "layoutImage")
image.hasMany(imageThumbnail, "thumbnails")

const store = createStore({
  relationalCreators: [
    user,
    image,
    imageThumbnail,
    post,
    postComment,
  ],
  indexes: [homeFeed, postComments, profilePosts],
  identifier: {
    user: o => "username" in o,
    post: o => "caption" in o,
    image: o => "baseScale" in o,
    thumbnail: o => "uri" in o,
    postComment: o => "replyingToId" in o
  }
});

export type From = "user" | "post" | "image" | "thumbnail" | "postComment"

// store.upsert([...posts, ...posts], { indexes: [{ index: "homeFeed", key: "1" }] })

// store.upsert({ id: 3, username: "John" })

// type User = { id: number; username: string }
// type Image = { id: number; baseScale: number; thumbnails: Thumbnail[] }
// type Thumbnail = { id: number; height: number; widht: number; uri: string; }

// const result = store.select<"post", any>({
//   from: "post",
//   fields: "*",
//   where: { id: 10 },
//   join: [
//     {
//       on: "user",
//       fields: "*",
//     }
//   ],
// })

// console.log(result)

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


store.upsert([
  {
    "id": 2,
    "caption": "First",
    "contentRating": "R18",
    "createdAt": "2023-08-15T06:27:24.000Z",
    "likeCount": 0,
    "commentsCount": 0,
    "isLiked": 0,
    "images": [
      {
        "id": 2,
        "baseScale": "1",
        "pinchScale": "1",
        "translateX": "0",
        "translateY": "0",
        "originContainerWidth": "392.7272644042969",
        "originContainerHeight": "360.7272644042969",
        "aspectRatio": 0.789062,
        "thumbnails": null
      }
    ],
    "user": {
      "id": 1,
      "username": "qwerty",
      "profileImage": null
    }
  }
], {
  indexes: [{ index: "homeFeed", key: "home" }]
})

const result = store.selectIndex("homeFeed-home", {
  post: {
    from: "post",
    // @ts-ignore
    where: { id: 10 },
    fields: ["user", "createdAt"],
    join: [
      {
        on: "user",
        fields: ["username", "profileImage"],
        join: [
          {
            on: "profileImage",
            fields: "*",
            join: [{ on: "thumbnails", fields: "*" }]
          }
        ]
      }
    ]
  }
})

console.log(result)