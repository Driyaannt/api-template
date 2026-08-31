import express from 'express'; import helmet from 'helmet'; import cors from 'cors'; import cookieParser from 'cookie-parser'; import rateLimit from 'express-rate-limit'; import { randomUUID } from 'node:crypto'; import { authRouter } from './modules/auth/auth.routes.js'; import { AppError } from './errors/app-error.js'; import { env } from './config/env.js';
export const app=express(); app.use((req,_res,next)=>{req.requestId=randomUUID();next();}); app.use(helmet());app.use(cors({origin:env.CORS_ORIGIN,credentials:true}));app.use(express.json({limit:'1mb'}));app.use(cookieParser());app.use(rateLimit({windowMs:15*60*1000,limit:300,standardHeaders:true,legacyHeaders:false}));
app.get('/api/v1/health',(_req,res)=>res.json({success:true,message:'Healthy',data:{status:'ok'}}));app.get('/api/v1/ready',(_req,res)=>res.json({success:true,message:'Ready',data:{status:'ready'}}));
app.get('/api/v1/openapi.json',(_req,res)=>res.json({openapi:'3.0.3',info:{title:'backend-driya API',version:'0.1.0'},paths:{'/api/v1/auth/login':{post:{tags:['Authentication'],summary:'Login'}}}}));app.use('/api/v1/auth',authRouter);
app.use((_req,_res,next)=>next(new AppError(404,'NOT_FOUND','Route not found')));
app.use((err:unknown,req:express.Request,res:express.Response,_next:express.NextFunction)=>{
  const e = err instanceof AppError ? err : err instanceof Error && err.name === 'ZodError'
    ? new AppError(400,'VALIDATION_ERROR','Validation failed',(err as unknown as {issues:{path:(string|number)[];message:string}[]}).issues.map(i=>({field:i.path.join('.'),message:i.message})))
    : new AppError(500,'INTERNAL_ERROR','An unexpected error occurred');
  res.status(e.status).json({success:false,message:e.message,code:e.code,errors:e.details,requestId:req.requestId});
});
