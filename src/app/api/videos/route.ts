import Video, { Ivideo } from "@/models/Videos";
import { authOptions } from "@/util/auth";
import { connectToDatabase } from "@/util/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { error } from "console";


export async function GET() {
    try {
        await connectToDatabase()
        const videos = await Video.find({}).sort({createdAt: -1}).lean()
        if(!videos || videos.length === 0){
            return NextResponse.json([],{status: 200})
        }
        return NextResponse.json(videos)

    } catch (error) {
        return NextResponse.json(
            {error: "Failed to fetch videos"},
            {status: 200}
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if(!session){
            return NextResponse.json(
                {error: "Unauthorized"},
                {status: 401}
            )
        }
        await connectToDatabase()
        const body:Ivideo = await request.json()

        if(
            !body.title ||
            !body.description ||
            !body.videoURL ||
            !body.thumbnailURL
        ){
            return NextResponse.json(
                {error: "Missing Required Fields"},
                {status: 400}
            );
        }

        const videoData = {
            ...body,
            controls: body.controls ?? true,
            transformation: {
                height: 1920,
                width: 1080,
                quality: body.tranformation?.quality ?? 100
            }
        }

        const newVideo = await Video.create(videoData)
        return NextResponse.json(newVideo)

    } catch (error) {
        return NextResponse.json(
            {error: "Failed to Upload a video"},
            {status: 200}
        )
    }
}