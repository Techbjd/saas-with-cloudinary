
import { NextRequest,NextResponse } from 'next/server';
import { v2 as cloudinary, UploadStream } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from "@/app/generated/prisma";



    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_SECRET_API_KEY // Click 'View API Keys' above to copy your API secret
    });
    
//using typescript design the interface
interface CloudinaryUploadResult 
{ 
    public_id:string;//most woried about
    [key:string]:any
    //not idealistic
}

   export async function POST (request:NextRequest){

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
    const file= formData.get("file") as File |null
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
            {folder:"next-cloudinary-uploads"},
             (error,result)=>{
                if(error) reject(error)
                else resolve(result as CloudinaryUploadResult);
            }
        )   
        uploadStream.end(buffer)
    }
)
return NextResponse.json(
    {publicId: result.public_id},
    {status:200}
)
 
    
} 
catch (error) {
 
    console.log("Upload image failed",error)
    return NextResponse.json({error:"uploas image failed"},
    {status:500})
}


   }