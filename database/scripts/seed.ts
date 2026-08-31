import 'dotenv/config';
import argon2 from 'argon2';
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
type EndpointSeed = [string,string,string,string,string,boolean,object|null];
async function main() {
  for (const name of ['SUPER_ADMIN','ADMIN','USER']) await pool.query('INSERT INTO roles(name) VALUES($1) ON CONFLICT(name) DO NOTHING',[name]);
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.test'; const hash = await argon2.hash(process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!');
  const user = await pool.query<{id:string}>('INSERT INTO users(name,email,password_hash,email_verified_at) VALUES($1,$2,$3,NOW()) ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name RETURNING id',['Super Admin',email,hash]);
  const role = await pool.query<{id:string}>('SELECT id FROM roles WHERE name=$1',['SUPER_ADMIN']); await pool.query('INSERT INTO user_roles(user_id,role_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[user.rows[0].id,role.rows[0].id]);
  for(let i=1;i<=20;i++) await pool.query('INSERT INTO products(name,sku,description,price,stock,created_by) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(sku) DO NOTHING',[`Sample Product ${i}`,`SKU-${String(i).padStart(3,'0')}`,'Seed product',i*10,100,user.rows[0].id]);
  const endpoints: EndpointSeed[] = [
    ['GET','/health','Health check','System status','System',false,null], ['GET','/ready','Readiness check','Service readiness','System',false,null],
    ['POST','/auth/register','Register','Create a user account','Authentication',false,{name:'Jane Doe',email:'jane@example.test',password:'<choose-a-strong-password>'}],
    ['POST','/auth/login','Login','Obtain an access token','Authentication',false,{email:'admin@example.test',password:'<your-password>'}],
    ['POST','/auth/refresh','Refresh token','Refresh access token','Authentication',false,null], ['POST','/auth/logout','Logout','Revoke refresh token','Authentication',false,null],
    ['GET','/auth/me','Current profile','Read authenticated user','Authentication',true,null], ['GET','/products','List products','Pagination, search, filter, sorting','Products',false,null], ['GET','/products/{id}','Product detail','Read product by UUID','Products',false,null]
  ];
  for (const [method,path,name,description,module,requiresAuth,example] of endpoints) await pool.query('INSERT INTO api_endpoints(method,path,name,description,module,requires_auth,request_example) VALUES($1,$2,$3,$4,$5,$6,$7::jsonb) ON CONFLICT(method,path) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,module=EXCLUDED.module,requires_auth=EXCLUDED.requires_auth,request_example=EXCLUDED.request_example',[method,path,name,description,module,requiresAuth,example ? JSON.stringify(example) : null]);
  await pool.query(`INSERT INTO application_settings(key,value) VALUES('app_name','"backend-driya"') ON CONFLICT(key) DO NOTHING`);
  console.log(`Seeded ${email} and API catalog`);
}
main().finally(()=>pool.end());
