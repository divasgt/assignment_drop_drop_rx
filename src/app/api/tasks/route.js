import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const {data, error} = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', {ascending: false}) // Sort by created_at descending

  if (error) return NextResponse.json(
    {error: error.message},
    {status: 500}
  )
  return NextResponse.json(data)
}

export async function POST(request) {
  const {title, description} = await request.json()
  
  const {data, error} = await supabase
    .from('tasks')
    .insert([{
      title,
      description
    }])
    .select() // .select() returns only the newly created row

  if (error) return NextResponse.json(
    {error: error.message},
    {status: 500}
  )
  return NextResponse.json(data[0])
}