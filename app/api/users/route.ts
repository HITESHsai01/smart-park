import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        role: body.role, // CUSTOMER or OWNER
      },
    })

    return NextResponse.json(user)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}