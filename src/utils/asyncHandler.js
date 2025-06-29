                                 // promises


const asyncHandler = (reqHandler) =>{
   return (req,res,next) =>{
        Promise.resolve(reqHandler(req,res,next))
        .catch((err) => next(err))
    }
}

export { asyncHandler }







                                 // try and catch
// const asyncHandler = ()=>{}

// const asyncHandler = (function) => {() => {} }

// remove last paranthesis for higher order function


// const asyncHandler = (fn)=> async (req,res,next) =>{
//     try{
//         await fn(req,res,next)
//     }
//     catch(error){
//         res.send(err.code || 500).json({
//             success:false,
//             message: err.message
//         })
//     }
// }