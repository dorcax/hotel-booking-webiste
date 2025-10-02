export const createAttachments=(uploads?:string[])=>{
// if(!uploads || uploads.length===0) {
//     return undefined
// }
return {
    create:{
        uploads:{
            connect:uploads?.map((id)=>({id}))
        }
    }
}
}


export const updateAttachments=(uploads?:string[])=>{
    return {
        update:{
            uploads:{
                set:uploads?.map((upload)=>({id:upload}))
            }
        }
    }

}


// export const connectId=(id:string)=>{
//     return {
//         connect:{
//             id:id
//         }
//     }

// } 

export const connectId=(id:string)=>({
    connect:{id}
})