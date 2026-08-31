import { Router } from 'express';
import { z } from 'zod';
import { query } from '../../database/raw/pool.js';
import { AppError } from '../../errors/app-error.js';
import { authenticate } from '../../middlewares/authenticate.js';
const router=Router(); const bodySchema=z.record(z.unknown()); const idSchema=z.string().uuid();
router.get('/',authenticate,async(req,res,next)=>{try{const result=await query<{endpoint_id:string;body:Record<string,unknown>;updated_at:Date}>('SELECT endpoint_id,body,updated_at FROM api_request_drafts WHERE user_id=$1',[req.user!.id]);res.json({success:true,message:'Drafts retrieved successfully',data:result.rows});}catch(error){next(error);}});
router.put('/:endpointId',authenticate,async(req,res,next)=>{try{const endpointId=idSchema.parse(req.params.endpointId);const body=bodySchema.parse(req.body);const endpoint=await query<{module:string}>('SELECT module FROM api_endpoints WHERE id=$1',[endpointId]);if(!endpoint.rows[0])throw new AppError(404,'ENDPOINT_NOT_FOUND','Endpoint not found');if(endpoint.rows[0].module==='Authentication')throw new AppError(400,'SENSITIVE_DRAFT','Authentication request bodies cannot be saved');await query('INSERT INTO api_request_drafts(user_id,endpoint_id,body) VALUES($1,$2,$3::jsonb) ON CONFLICT(user_id,endpoint_id) DO UPDATE SET body=EXCLUDED.body,updated_at=NOW()',[req.user!.id,endpointId,JSON.stringify(body)]);res.json({success:true,message:'Draft saved successfully',data:null});}catch(error){next(error);}});
export { router as draftsRouter };
