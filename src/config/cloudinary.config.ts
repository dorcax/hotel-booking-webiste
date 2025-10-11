import {v2 as cloudinary} from "cloudinary"
import * as streamifier from "streamifier"

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})



export const handleUpload =async(fileBuffer:Buffer)=>{
    return new Promise((resolve,reject)=>{
        const uploadStream = cloudinary.uploader.upload_stream((error,result)=>{
            if(error){
                return reject(error)
            }
            return resolve(result)
        }

    )
    streamifier.createReadStream(fileBuffer).pipe(uploadStream)

    })
    // const res =await cloudinary.uploader.upload(file)
    // return res 

}

export default cloudinary