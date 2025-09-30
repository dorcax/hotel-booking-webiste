export const createAttachment=(uploads:string[])=>{
if(!uploads.length) return undefined
return {
    create:{
        uploads:{
            connect:uploads.map((id)=>({id}))
        }
    }
}
}