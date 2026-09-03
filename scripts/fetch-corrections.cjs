const fs=require("fs"),path=require("path");
const env=fs.readFileSync(path.join(__dirname,"..",".env.local"),"utf-8");
for(const line of env.split("\n")){const m=line.match(/^([A-Z_]+)=(.*)$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].trim();}
const {createClient}=require("@supabase/supabase-js");
const s=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_KEY);
(async()=>{const {data,error}=await s.from("corrections").select("*").order("created_at",{ascending:true});
if(error){console.error(error);process.exit(1);}
console.log(JSON.stringify(data,null,2));})();
