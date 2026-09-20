import { migrateExistingImages } from "../lib/migrate-images";

const result = await migrateExistingImages();
console.log(JSON.stringify(result, null, 2));
