import { notFound, parseBucketPath } from "@/utils/bucket";

export async function onRequestGet(context) {
  try {
    const [bucket, path] = parseBucketPath(context);
    const prefix = path && `${path}/`;

    const objList = await bucket.list({
      prefix,
      delimiter: "/",
      include: ["httpMetadata", "customMetadata"],
    });
    const objKeys = objList.objects
      .filter((obj) => !obj.key.endsWith("/_$folder$"))
      .map((obj) => {
        const { key, size, uploaded, httpMetadata, customMetadata } = obj;
        return { key, size, uploaded, httpMetadata, customMetadata };
      });

    let folders = objList.delimitedPrefixes;
    return new Response(JSON.stringify({ value: objKeys, folders }), {
      headers: { "Content-Type": "application/json",
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*'},
    });
  } catch (e) {
    return new Response(e.toString(), { status: 500 });
  }
}
