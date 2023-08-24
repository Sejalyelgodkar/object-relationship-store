## @jjmyers/object-relationship-store

A javascript object relationship store. Normalises data upserted and maintains relationships between objects.

Built to work with react's **useSyncExternalStore()** hook.

## Example usage
```tsx

import { type ORS, withOptions, createStore, createRelationalObjectIndex, createRelationalObject } from "@jjmyers/object-relationship-store"

/**
 * Example data
 * https://gist.github.com/JoshBot-Debug/d1fb23a01981d1567191b27fab0a7117
 */
const posts = []


// A helper function for the documentation.
// Don't write tests like this, use jest or something else.
const isTrue = (message: string, value: boolean) => {
  if (!value) throw new Error(`Value was not true! - ${message}`);
  console.log(`[${String(value).toUpperCase()}] ${message}`)
}

const user = createRelationalObject("user")
const image = createRelationalObject("image")
const thumbnail = createRelationalObject("thumbnail")
const post = createRelationalObject("post")

const homeFeed = createRelationalObjectIndex("homeFeed", [post])

post.hasOne(user)
post.hasMany(image, "images")

user.hasMany(post, "posts")
user.hasOne(image, "profileImage")
image.hasMany(thumbnail, "thumbnails")

const store = createStore({
  relationalCreators: [
    user,
    image,
    thumbnail,
    post,
  ],
  indexes: [homeFeed],
  identifier: {
    user: o => "username" in o,
    post: o => "caption" in o,
    image: o => "aspectRatio" in o,
    thumbnail: o => "uri" in o,
  }
});

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
      on: "thumbnails",
      fields: ["id"]
    }
  ],
})

// We have a result here.
// console.log(result)
isTrue("Result is the object we expected", JSON.stringify(result) === '[{"id":48,"aspectRatio":0.777344,"thumbnails":[{"id":186},{"id":187}]}]')


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



console.log("\n\n4. SELECT DATA FROM INDEX\n")

/**
 * While the above ability to upsert, select and delete covers most cases,
 * sometimes the order in which the data was received is important.
 * 
 * Like in a feed where you can scroll down infinitely.
 * 
 * For this, example, we have "homeFeed" index
 * 
 * const homeFeed = createRelationalObjectIndex("homeFeed", [post])
 * 
 * We named it "homeFeed" and said that it contains post objects. You can pass multiple objects to to an index,
 * like this for example
 * 
 * Here we are saying homeFeed contains posts, articles and newsArticles.
 * const homeFeed = createRelationalObjectIndex("homeFeed", [post, article, newsArticle])
 * 
 * In this example, we will use only one type of object in the index, "post".
 * 
 * The index behaves very similar to a regular select and upsert, there are only a few differences
 */

// Upsert data
// Here we used withOptions() to upsert and array of posts to the store, and we
// Also mentioned an index
store.upsert(withOptions(posts, { __indexes__: ["homeFeed-home"] }))

/**
 * 
 * An indexKey is broken into two parts
 * "homeFeed" - which is the name of the index
 * "home" - which is a unique key
 * 
 * They are seperated by "-"
 * 
 * This is because if you have an index called "comments", you want seperate indexes for them.
 * Example comments page for post id 1, 2, 3
 * All have different comments
 * 
 * So the index will be something like this for example
 * By providing different unique keys, "comments" will create new indexes for each of them.
 * "comments-postId1"
 * "comments-postId2"
 * "comments-postId3"
 * 
 */

/**
 * The order of the index by default will be the order in which it was upserted,
 * However, when creating an index, you can pass a sorting function like so:~
 * 
 * const homeFeed = createRelationalObjectIndex("homeFeed", [post], (a, b) => a.id > b.id ? -1 : 1)
 */

const selected = store.selectIndex("homeFeed-home", {

  /**
   * This select object is the same as the one above except,
   * The "where" can only be a function
   */
  post: {
    from: "post",
    fields: ["id"],
  },

  // If we had more than one object type in this index
  // article: { from: "article", fields: ["id"] }
})

isTrue("Result is the an array containg posts, in the order it was upserted.", JSON.stringify(selected) === '[{"id":10},{"id":9},{"id":8},{"id":7},{"id":6}]')

// Here we upsert another post with ID of 5
store.upsert(withOptions({ id: 5 }, { __indexes__: ["homeFeed-home"], __identify__: "post" }))

// We select the index again
const selected2 = store.selectIndex("homeFeed-home", { post: { from: "post", fields: ["id"] } })

isTrue("The additional post was added to the index.", JSON.stringify(selected2) === '[{"id":10},{"id":9},{"id":8},{"id":7},{"id":6},{"id":5}]')

console.log("\nEND OF SELECT INDEX DEMO\n")


/**
 * If we want to remove the object from an index without destroying it, it can be done using __removeFromIndexes__
 */

// Here we upsert post with ID of 5, and remove it from the homeFeed-home index
// Upsert with and update the current object if needed.
store.upsert(withOptions({ id: 5, content: "Update fields if needed" }, { __removeFromIndexes__: "homeFeed-home", __identify__: "post" }))

// @ts-ignore
const result1 = store.select({ from: "post", fields: ["id", "content"], where: { id: 5 } })

// @ts-ignore
const selected3 = store.selectIndex("homeFeed-home", { post: { from: "post", fields: ["id"] } })
isTrue("The post was removed from the index.", JSON.stringify(selected3) === '[{"id":10},{"id":9},{"id":8},{"id":7},{"id":6}]')

//@ts-ignore
isTrue("The content in the post was updated.", result1.content === 'Update fields if needed')

```