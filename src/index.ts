import withOptions from "./lib/helper/withOptions";
import { createStore, createRelationalObject, createRelationalObjectIndex } from "./lib/index";

/**
 * Example data
 */
const posts = [
  {
    "id": 10,
    "caption": "This is post 10",
    "createdAt": "2023-06-26T14:24:04.000Z",
    "images": [
      {
        "id": 54,
        "aspectRatio": 0.890625,
        "thumbnails": [
          { "id": 206, "uri": "/post.1687789438225.0-1.128.jpeg" },
          { "id": 207, "uri": "/post.1687789438225.0-2.256.jpeg" },
        ]
      },
      {
        "id": 55,
        "aspectRatio": 0.773438,
        "thumbnails": [
          { "id": 211, "uri": "/post.1687789438226.1-1.128.jpeg" },
          { "id": 212, "uri": "/post.1687789438226.1-2.256.jpeg" },
        ]
      },
      {
        "id": 56,
        "aspectRatio": 0.890625,
        "thumbnails": [
          { "id": 216, "uri": "/post.1687789438226.2-1.128.jpeg" },
          { "id": 217, "uri": "/post.1687789438227.2-2.256.jpeg" },
        ]
      },
      {
        "id": 57,
        "aspectRatio": 0.890625,
        "thumbnails": [
          { "id": 221, "uri": "/post.1687789438227.3-1.128.jpeg" },
          { "id": 222, "uri": "/post.1687789438227.3-2.256.jpeg" },
        ]
      }
    ],
    "user": {
      "id": 2,
      "username": "qwerty",
      "profileImage": {
        "id": 48,
        "aspectRatio": 0.777344,
        "thumbnails": [
          { "id": 186, "uri": "/profilePhoto.256.jpeg?1687444436097" },
          { "id": 187, "uri": "/profilePhoto.512.jpeg?1687444436097" },
        ]
      }
    }
  },
  {
    "id": 9,
    "caption": "This is post 9",
    "createdAt": "2023-06-25T15:03:16.000Z",
    "images": [
      {
        "id": 53,
        "aspectRatio": 0.890625,
        "thumbnails": [
          { "id": 201, "uri": "/post.1687705393873.0-1.128.jpeg" },
          { "id": 202, "uri": "/post.1687705393873.0-2.256.jpeg" },
        ]
      }
    ],
    "user": {
      "id": 2,
      "username": "qwerty",
      "profileImage": {
        "id": 48,
        "aspectRatio": 0.777344,
        "thumbnails": [
          { "id": 186, "uri": "/profilePhoto.256.jpeg?1687444436097" },
          { "id": 187, "uri": "/profilePhoto.512.jpeg?1687444436097" },
        ]
      }
    }
  },
  {
    "id": 8,
    "caption": "This is post 8",
    "createdAt": "2023-06-21T16:13:41.000Z",
    "images": [
      {
        "id": 47,
        "aspectRatio": 0.890625,
        "thumbnails": [
          { "id": 181, "uri": "/post.1687364014093.0-1.128.jpeg" },
          { "id": 182, "uri": "/post.1687364014093.0-2.256.jpeg" },
        ]
      }
    ],
    "user": {
      "id": 1,
      "username": "the_overlord",
      "profileImage": {
        "id": 52,
        "aspectRatio": 1.38378,
        "thumbnails": [
          { "id": 198, "uri": "/profilePhoto.256.jpeg?1687545543490" },
          { "id": 199, "uri": "/profilePhoto.512.jpeg?1687545543491" },
        ]
      }
    }
  },
  {
    "id": 7,
    "caption": "This is post 7",
    "createdAt": "2023-06-21T13:48:10.000Z",
    "images": [
      {
        "id": 46,
        "aspectRatio": 1.77778,
        "thumbnails": [
          { "id": 176, "uri": "/post.1687355288548.0-1.128.jpeg" },
          { "id": 177, "uri": "/post.1687355288548.0-2.256.jpeg" },
        ]
      }
    ],
    "user": {
      "id": 1,
      "username": "the_overlord",
      "profileImage": {
        "id": 52,
        "aspectRatio": 1.38378,
        "thumbnails": [
          { "id": 198, "uri": "/profilePhoto.256.jpeg?1687545543490" },
          { "id": 199, "uri": "/profilePhoto.512.jpeg?1687545543491" },
        ]
      }
    }
  },
  {
    "id": 6,
    "caption": "This is post 6",
    "createdAt": "2023-06-20T17:02:23.000Z",
    "images": [
      {
        "id": 43,
        "aspectRatio": 0.710938,
        "thumbnails": [
          { "id": 161, "uri": "/post.1687280539761.0-1.128.jpeg" },
          { "id": 162, "uri": "/post.1687280539761.0-2.256.jpeg" },
        ]
      },
      {
        "id": 44,
        "aspectRatio": 1.6,
        "thumbnails": [
          { "id": 166, "uri": "/post.1687280539761.1-1.128.jpeg" },
          { "id": 167, "uri": "/post.1687280539761.1-2.256.jpeg", },
        ]
      },
      {
        "id": 45,
        "aspectRatio": 1.77778,
        "thumbnails": [
          { "id": 171, "uri": "/post.1687280539762.2-1.128.jpeg" },
          { "id": 172, "uri": "/post.1687280539762.2-2.256.jpeg" },
        ]
      }
    ],
    "user": {
      "id": 2,
      "username": "qwerty",
      "profileImage": {
        "id": 48,
        "aspectRatio": 0.777344,
        "thumbnails": [
          { "id": 186, "uri": "/profilePhoto.256.jpeg?1687444436097" },
          { "id": 187, "uri": "/profilePhoto.512.jpeg?1687444436097" },
        ]
      }
    }
  }
]

// A helper function for the documentation.
// Don't write tests like this, use jest or something else.
const isTrue = (message: string, value: boolean) => {
  if (!value) throw new Error(`Value was not true! - ${message}`);
  console.log(`[${String(value).toUpperCase()}] ${message}`)
}

const user = createRelationalObject("user")
const image = createRelationalObject("image")
const imageThumbnail = createRelationalObject("thumbnail")
const post = createRelationalObject("post")
const postComment = createRelationalObject("postComment")

const homeFeed = createRelationalObjectIndex("homeFeed", [post])
const postComments = createRelationalObjectIndex("postComments", [postComment], (a, b) => a.id > b.id ? -1 : 1)

postComment.hasMany(postComment, "replies")
postComment.hasOne(postComment, "replyingTo")
postComment.hasOne(post)
postComment.hasOne(user)

post.hasOne(user)
post.hasMany(image, "images")

user.hasMany(image, "images")
image.hasMany(user, "users")

user.hasMany(post, "posts")
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
  indexes: [homeFeed, postComments],
  identifier: {
    user: o => "username" in o,
    post: o => "caption" in o,
    image: o => "aspectRatio" in o,
    thumbnail: o => "uri" in o,
    postComment: o => "replyingToId" in o
  }
});

export type From = "user" | "post" | "image" | "thumbnail" | "postComment"


console.log("\n\n1. UPSERT DATA INTO THE STORE\n")

/**
 * Upsert one object in the store
 */
store.upsert(posts[0])
isTrue("One object upserted", Object.keys(store.getState().post).length === 1)


/**
 * Upsert many objects in the store
 */
store.upsert(posts)
isTrue("Many object upserted", Object.keys(store.getState().post).length === 5)


/**
 * Upsert an object and manually determine the type
 */
try { store.upsert({ id: 11 }) }
catch (error: any) {
  // Because this post does not contain a "caption" field, the identifier
  // will fail to identify the object
  isTrue("Cannot identify the object", error.message === 'Identifier was not able to identify this object {"id":11}')
}

// If identifier cannot determine the type of the object, 
// you can manually specify the type like this
store.upsert({ id: 11, __identify__: "post" })
isTrue("Used __identify__ to determine the type of the object", Object.keys(store.getState().post).length === 6)


// You can also use withOptions()
store.upsert(withOptions({ id: 11 }, { __identify__: "post" }))
isTrue("Used withOptions() to determine the type of the object", Object.keys(store.getState().post).length === 6)


// withOptions() also accepts a callback on all options,
// you can use the callback to check the object
store.upsert(withOptions({ id: 11 }, { __identify__: o => { if (o.id === 11) { return "post" } throw new Error("Should never come here"); } }))
isTrue("Used withOptions() callback to determine the type of the object", Object.keys(store.getState().post).length === 6)


// You can also use withOptions() to identify an array of objects
store.upsert(withOptions([{ id: 11 }, { id: 12 }], { __identify__: "post" }))
isTrue("Used withOptions() to determine the type of an array of objects", Object.keys(store.getState().post).length === 7)


// withOptions() also accepts a callback on all options,
// you can use the callback to check all the objects
try {
  store.upsert(withOptions([{ id: 11 }, { id: 12 }], { __identify__: o => { if (o.id === 11) { return "post" } throw new Error(`id ${o.id}`); } }))
} catch (error: any) {
  isTrue("Expect id 12 to not be identified.", error.message === "id 12")
}


/**
 * So far we've seen a few ways to upsert data
 *
 * store.upsert({...someObject})
 *
 * store.upsert([ {...someObject}, {...someOtherObject} ])
 *
 * store.upsert({...someObject, __identify__: "post" })
 *
 * store.upsert(withOptions({...someObject}, { __identify__: "post" } ))
 */

console.log("\nEND OF UPSERT DEMO\n")


console.log("\n\n2. DELETE DATA FROM THE STORE\n")

/**
 * Deleting an object from the store is the same as upsert
 * Except, there's one small difference
 */
isTrue("Post 12 exists", !!store.getState().post[12])

store.upsert({ id: 12, __identify__: "post", __destroy__: true })

isTrue("Post 12 does not exist", !store.getState().post[12])


/**
 * To delete an object, just pass __destroy__ as true
 *
 * This can be done on an array or a single object. You can also use withOptions()
 *
 * Note: All orphaned children and references to the object will be removed.
 */

/**
 * All references are gone.
 */
isTrue("Profile image 52 exists on user 1", store.getState().user[1].profileImage === 52)

// Delete an image where the id is 52
// Destroy can be done on an array or a single object. You can also use withOptions()
store.upsert({ id: 52, __identify__: "image", __destroy__: true })

isTrue("Profile image 52 does not exist on user 1", store.getState().user[1].profileImage === undefined)



/**
 * All orphaned children are gone
 */

isTrue("User 2 has posts 10, 9, 6", JSON.stringify(store.getState().user[2].posts) === "[10,9,6]")
isTrue("Post 10, 9, 6 all exist", !!store.getState().post[10] && !!store.getState().post[9] && !!store.getState().post[6])
// Deleted user where id is 2
// Destroy can be done on an array or a single object. You can also use withOptions()
store.upsert(withOptions([{ id: 2 }], { __identify__: "user", __destroy__: true }))
isTrue("User 2 is deleted", !store.getState().user[2])
isTrue("Post 10, 9, 6 all deleted", !store.getState().post[10] && !store.getState().post[9] && !store.getState().post[6])



/**
 * So we've seen that we can delete data from the store and all references and orphaned children are deleted as well.
 * 
 * If you do not want this behaviour, you'll have to do a soft delete by using a key in you object like "isDeleted". You will
 * handle it manually (if isDeleted hide) or something like that.
 * 
 * Destroy can be done on an array or a single object. You can also use withOptions()
 * 
 */

console.log("\nEND OF DELETE DEMO\n")


console.log("\n\n3. SELECT DATA FROM THE STORE\n")

// Upsert posts again so that we have data to work with
store.upsert(posts)

/**
 * This is how you select data
 * 
 * store.select()
 */
const result = store.select({

  // Name of the object you want to select
  from: "image",

  /**
   * Fields, can be "*" for all fields OR an array like ["id", "users", "thumbnail"]
   * 
   * fields: "*"
   * fields: ["id", "users", "thumbnail"]
   * 
   * If you don't type the function, you may need to add @ts-ignore
   */
  // @ts-ignore
  // fields: ["id", "users", "thumbnails"],
  fields: "*",

  /**
   * The where clause,
   * can be an object, and array of object or a function.
   * Using the primaryKey of the object will be faster than using other properties.
   * 
   * where: {id: 48}                    // Will return an object or null
   * where: [ {id: 48}, {id: 49} ]      // Will return an array of matching objects or an empty array
   * where o => [48, 49].includes(o.id) // Will return an array of matching objects or an empty array
   * where: { aspectRatio: 0.777344 },  // Will return an array of matching objects or an empty array
   * 
   */
  where: { aspectRatio: 0.777344 },

  /**
   * Join operation,
   * if you don't use a join, any objects referenced in the selected object will be the primaryKey
   * If you want the object instead of the primaryKey, join!
   * 
   * Depending on the structure of you object, you need to build you join.
   */
  join: [
    {
      on: "users",
      fields: "*",
      join: [
        { on: "profileImage", fields: "*" }
      ]
    },
    {
      on: "thumbnails",
      fields: ["id"]
    }
  ],
})

// We have a result here.
// console.log(result)
isTrue("Result is the object we expected", JSON.stringify(result) === '[{"id":48,"aspectRatio":0.777344,"thumbnails":[{"id":186},{"id":187}],"users":[{"id":2,"username":"qwerty","profileImage":{"id":48,"aspectRatio":0.777344,"thumbnails":[186,187],"users":[2]},"posts":[10,9,6]}]}]')


/**
 * 
 * Note: The result from store.select() is memonized
 * 
 * It will change only if the object changes or the select statement changes
 * 
 */

console.log("\nEND OF SELECT DEMO\n")


/**
 * So far we have:
 * 1. Upsert one object into the store
 * 2. Upserted many objects into the store
 * 3. Delete one and many objects and all references and orphaned children
 * 4. Selected one object and an array of objects
 */


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