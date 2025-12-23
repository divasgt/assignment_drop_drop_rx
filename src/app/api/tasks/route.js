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

export async function DELETE(request) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  
  if (!id) return NextResponse.json(
    {error: "No id provided"},
    {status: 500}
  )

  const {data, error} = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json(
    {error: error.message},
    {status: 500}
  )
  return NextResponse.json({message: "Task deleted successfully."})
}

export async function PATCH(request) {
  const url = new URL(request.url)
  const id = url.searchParams.get("id")
  const updatedData = await request.json()

  if (!id) return NextResponse.json(
    {error: "No id provided"},
    {status: 500}
  )

  const {data, error} = await supabase
    .from('tasks')
    .update(updatedData)
    .eq('id', id)
    .select()
  
  if (error) return NextResponse.json(
    {error: error.message},
    {status: 500}
  )
  return NextResponse.json(data[0])
}