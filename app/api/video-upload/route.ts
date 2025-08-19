
import { NextRequest,NextResponse } from 'next/server';
import { v2 as cloudinary, UploadStream } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from "@/app/generated/prisma";


const Prisma = new PrismaClient()

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_SECRET_API_KEY
    });
    
//using typescript design the interface
interface CloudinaryUploadResult 
{ 
    public_id:string;//most woried about
    
    bytes:number;
    duration?:number;
    [key:string]:any
    //not idealistic
}


   export async function POST(request:NextRequest){
console.log("Video upload API hit");
if(!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME||!process.env.CLOUDINARY_API_KEY||!process.env.CLOUDINARY_SECRET_API_KEY){
    return NextResponse.json({
        message:"error in cloudinary creditional  not found"
    },{status:500})
}
   
    const {userId}=await auth()
    if(!userId){
        return NextResponse.json(
            {error:"Unauthorized user "},
            {  status:401}
    ) }

//grab form data convert into file
try {
    const formData=await request.formData();
    //it need to cast as file
    const file= formData.get("file") as File |null;
const title=formData.get("title") as string;
const description=formData.get("description") as string;
const originalSize=formData.get("originalSize") as string;


if(!file){
        return NextResponse.json(
            {error:"file not find  "},
            {  status:400}
    ) }

    //help for every data type
const bytes =await file.arrayBuffer();
const buffer=Buffer.from(bytes)
 
const result=await new Promise<CloudinaryUploadResult>(
    (resolve,reject)=>{
     const uploadStream= cloudinary.uploader.upload_stream(
            {
                resource_type:"video",
                folder:"video-cloudinary-uploads",
                transformation:[
                   {quality:"auto",fetch_format:"mp4"}
                ]//it is string
            },
             (error,result)=>{
                if(error) reject(error)
                else resolve(result as CloudinaryUploadResult);
            }
        )   
        uploadStream.end(buffer)
    }
)
const video= await Prisma.video.create({
    data:{
        title,
        description,
        publicId:result.public_id,
        originalSize:originalSize,
        compressedSize:String(result.bytes),
        duration:result.duration || 0,


    }
})
 return NextResponse.json(
      { success: true, video },
      { status: 200 }
    );
    
} 
catch (error) {
 
    console.log("Upload image failed",error)
    return NextResponse.json({error:"uploas image failed"},
    {status:500})
}


   }