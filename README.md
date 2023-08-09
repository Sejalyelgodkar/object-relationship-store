## @jjmyers/object-relationship-store

***WARNING: just trying out an idea.***

Utilizes javascripts object references to normalize data and keep relationships.

Built to work with react's **useSyncExternalStore()** hook.

## Example usage
```tsx

import { useDatatable, type Datatable } from "@jjmyers/object-relationship-store";

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
const blockedUsers = createRelationalObjectIndex("blockedUsers", [user])

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


// Upsert and array of posts
store.upsert(posts)

// Upsert one post
store.upsert(posts[0])

// Select a post
// Explore all the options
const result = store.select<"post", any>({
  from: "post",
  fields: ["id", "images"],

  // Can be an object, an array of objects
  // Or a callback
  where: { id: 10 },

  // An array of objects
  // where: [{id: 10}, {id: 9}]

  // A callback
  // where: (post) => post.user.id === 1

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

```