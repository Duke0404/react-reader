import Dexie, { type EntityTable } from "dexie"

interface Friend {
	id: number
	name: string
	age: number
}

interface Book {
	id: number
	title: string
	data: Blob
}

const db = new Dexie("FriendsDatabase") as Dexie & {
	friends: EntityTable<
		Friend,
		"id" // primary key "id" (for the typings only)
	>
	books: EntityTable<
		Book,
		"id" // primary key "id" (for the typings only)
	>
}

// Schema declaration:
db.version(1).stores({
	friends: "++id, name, age", // primary key "id" (for the runtime!)
	books: "++id, title, data" // primary key "id" (for the runtime!)
})

export type { Friend }
export type { Book }
export { db }
