import { NextResponse } from "next/server";
import { parse } from "csv-parse/sync";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    // console.log(file);
    const arrayBuffer = await file.arrayBuffer();//is creates web api buffer(not compatible with csv-parse)
    const buffer = Buffer.from(arrayBuffer);//now i have node compatible buffer(also compatible with csv parse)

    const records = parse(buffer, {
      columns: true,   
      skip_empty_lines: true,
    });

    const result = records.map((r) => ({
      ...r,
    }));
    const fileName = file.name;

    return NextResponse.json({ result,fileName });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
