// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { z } from "https://esm.sh/zod@3.23.8"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.0"

console.info("server started")

const LapDataSchema = z.object({
  driver_number: z.number().positive(),
  position: z.number().positive(),
  racer_name: z.string(),
  lap_number: z.number().positive(),
  lap_time_ms: z.number().positive(),
  gap: z.string().optional().nullable(),
  interval: z.string().optional().nullable(),
})

const LapsArraySchema = z.array(LapDataSchema)

Deno.serve(async (req) => {
  const SCRIPT_SECRET = Deno.env.get("SECRET_KEY")
  if (!SCRIPT_SECRET) {
    return new Response(
      JSON.stringify({ error: "Missing function secret configuration" }),
      { status: 500 }
    )
  }
  const authHeader = req.headers.get("Authorization")
  if (authHeader !== `Bearer ${SCRIPT_SECRET}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    })
  }

  const contentType = req.headers.get("content-type") || ""
  if (!contentType.includes("application/json")) {
    return new Response(
      JSON.stringify({ error: "Expected application/json" }),
      { status: 415, headers: { "Content-Type": "application/json" } }
    )
  }

  try {
    const body = await req.json()
    // --- Step 3: Expect an array under a "laps" key ---
    const laps = body?.laps

    if (!laps) {
      return new Response(
        JSON.stringify({ error: "Missing `laps` array in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Validate the incoming array against the schema
    const parsed = LapsArraySchema.safeParse(laps)
    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid data provided",
          details: parsed.error.format(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
    const SUPABASE_SERVICE_ROLE_KEY =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase environment variables" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    const supabaseAdmin = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { persistSession: false },
      }
    )

    // --- Step 4: Insert the entire validated array directly ---
    const { data, error: insertError } = await supabaseAdmin
      .from("laptimes") // Make sure this table name is correct
      .insert(parsed.data) // `parsed.data` is now the array of laps
      .select("*")

    if (insertError) {
      console.error("insert error", insertError)
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("unexpected error", err)
    const message = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
