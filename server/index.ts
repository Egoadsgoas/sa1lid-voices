import express from 'express';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import cors from 'cors';
import helmet from 'helmet';
import argon2 from 'argon2';
import { SignJWT, jwtVerify } from 'jose';
import { Server } from 'socket.io';
import { z } from 'zod';

type User={id:string;username:string;passwordHash:string;avatar?:string;status?:string;createdAt:number};
type Message={id:string;channel:string;ciphertext:string;iv:string;senderId:string;clientId:string;createdAt:number;deletedAt?:number};
type Db={users:User[];messages:Message[];friendships:{id:string;from:string;to:string;status:'pending'|'accepted';createdAt:number}[];blocks:{from:string;to:string;createdAt:number}[]};
const root=path.resolve(); const dataDir=path.join(root,'data'); fs.mkdirSync(dataDir,{recursive:true}); const dbFile=path.join(dataDir,'sa1lid.json');
const db:Db=fs.existsSync(dbFile)?JSON.parse(fs.readFileSync(dbFile,'utf8')):{users:[],messages:[],friendships:[],blocks:[]};
const persist=()=>fs.writeFileSync(dbFile,JSON.stringify(db,null,2)); const publicUser=(u:User)=>({id:u.id,username:u.username,avatar:u.avatar||'',status:u.status||'online'});
const app=express(),server=http.createServer(app),io=new Server(server,{cors:{origin:true,credentials:true},maxHttpBufferSize:2e6}); const port=Number(process.env.PORT||3000); const secret=new TextEncoder().encode(process.env.JWT_SECRET||crypto.randomBytes(32).toString('hex'));
app.use(helmet({contentSecurityPolicy:false,crossOriginEmbedderPolicy:false}));app.use(cors({origin:true,credentials:true}));app.use(express.json({limit:'256kb'}));
const credentials=z.object({username:z.string().trim().min(3).max(24).regex(/^[\p{L}\p{N}_.-]+$/u),password:z.string().min(8).max(128)});
async function token(user:User){return new SignJWT({sub:user.id,username:user.username}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('15m').sign(secret)}
async function auth(req:express.Request,res:express.Response,next:express.NextFunction){try{const raw=req.headers.authorization?.replace(/^Bearer /,'');if(!raw)throw 0;const {payload}=await jwtVerify(raw,secret);(req as any).userId=payload.sub;next()}catch{res.status(401).json({error:'Нужна авторизация'})}}
app.get('/api/health',(_req,res)=>res.json({status:'ok',service:'SA1LID VOICES',time:new Date().toISOString(),storage:process.env.SUPABASE_URL?'supabase':'local'}));
app.post('/api/auth/register',async(req,res)=>{const parsed=credentials.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Имя: 3–24 символа, пароль: минимум 8 символов'});if(db.users.some(u=>u.username.toLowerCase()===parsed.data.username.toLowerCase()))return res.status(409).json({error:'Это имя уже занято'});const user:User={id:crypto.randomUUID(),username:parsed.data.username,passwordHash:await argon2.hash(parsed.data.password,{type:argon2.argon2id}),createdAt:Date.now()};db.users.push(user);persist();res.status(201).json({accessToken:await token(user),user:publicUser(user)})});
app.post('/api/auth/login',async(req,res)=>{const parsed=credentials.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Проверьте имя и пароль'});const user=db.users.find(u=>u.username.toLowerCase()===parsed.data.username.toLowerCase());if(!user||!await argon2.verify(user.passwordHash,parsed.data.password))return res.status(401).json({error:'Неверное имя или пароль'});res.json({accessToken:await token(user),user:publicUser(user)})});
app.get('/api/users/search',auth,(req,res)=>{const q=String(req.query.q||'').toLowerCase().slice(0,24);res.json(db.users.filter(u=>u.username.toLowerCase().includes(q)).slice(0,20).map(publicUser))});
app.get('/api/friends',auth,(req,res)=>{const id=(req as any).userId;const ids=db.friendships.filter(x=>x.status==='accepted'&&(x.from===id||x.to===id)).map(x=>x.from===id?x.to:x.from);res.json(db.users.filter(u=>ids.includes(u.id)).map(publicUser))});
app.post('/api/friends/:id',auth,(req,res)=>{const from=(req as any).userId,to=String(req.params.id);if(from===to||!db.users.some(u=>u.id===to))return res.status(400).json({error:'Пользователь не найден'});if(db.blocks.some(x=>(x.from===from&&x.to===to)||(x.from===to&&x.to===from)))return res.status(403).json({error:'Контакт недоступен'});const inverse=db.friendships.find(x=>x.from===to&&x.to===from&&x.status==='pending');if(inverse)inverse.status='accepted';else if(!db.friendships.some(x=>x.from===from&&x.to===to))db.friendships.push({id:crypto.randomUUID(),from,to,status:'pending',createdAt:Date.now()});persist();res.json({ok:true})});
app.post('/api/blocks/:id',auth,(req,res)=>{const from=(req as any).userId,to=String(req.params.id);db.blocks=db.blocks.filter(x=>!(x.from===from&&x.to===to));db.blocks.push({from,to,createdAt:Date.now()});db.friendships=db.friendships.filter(x=>!((x.from===from&&x.to===to)||(x.from===to&&x.to===from)));persist();res.json({ok:true})});
app.get('/api/messages/:channel',auth,(req,res)=>res.json(db.messages.filter(m=>m.channel===req.params.channel&&!m.deletedAt).slice(-100)));
app.post('/api/messages/:id/delete',auth,(req,res)=>{const m=db.messages.find(x=>x.id===req.params.id);if(!m||m.senderId!==(req as any).userId)return res.status(403).json({error:'Недостаточно прав'});m.deletedAt=Date.now();persist();io.emit('message:deleted',{id:m.id,channel:m.channel});res.json({ok:true})});
io.on('connection',socket=>{socket.on('join-channel',(id:string)=>{if(typeof id!=='string'||id.length>80)return;for(const room of socket.rooms)if(room.startsWith('channel:'))socket.leave(room);socket.join(`channel:${id}`)});socket.on('message',(payload:any)=>{if(!payload||typeof payload.text!=='string'||payload.text.length>4000)return;const safe={id:String(payload.id||crypto.randomUUID()),channel:String(payload.channel||'general').slice(0,80),text:payload.text.slice(0,4000),user:{id:String(payload.user?.id||'guest'),username:String(payload.user?.username||'Гость').slice(0,24)},createdAt:Number(payload.createdAt)||Date.now()};socket.broadcast.emit('message',safe)});socket.on('typing',(channel:string)=>socket.to(`channel:${channel}`).emit('typing',{channel}));socket.on('voice:join',(room:string)=>{socket.join(`voice:${room}`);socket.to(`voice:${room}`).emit('voice:peer',{id:socket.id})});socket.on('voice:signal',({to,data})=>io.to(String(to)).emit('voice:signal',{from:socket.id,data}));socket.on('voice:leave',(room:string)=>{socket.leave(`voice:${room}`);socket.to(`voice:${room}`).emit('voice:left',{id:socket.id})})});
const dist=path.join(root,'dist');if(fs.existsSync(dist)){app.use(express.static(dist,{maxAge:'1h'}));app.get(/.*/,(_req,res)=>res.sendFile(path.join(dist,'index.html')))}
server.listen(port,()=>console.log(JSON.stringify({level:'info',message:'SA1LID VOICES started',port})));
