/* EDUVERSE shared identity — Supabase Auth + profiles */
(function(){
  "use strict";

  const SUPABASE_URL = "https://tlfuzdyblzlpogqlatkw.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_B2xxeE5MqRWUWlEF53fb4g_fifXKlO6";
  let client = null;
  let changeHandler = null;
  let currentProfile = null;

  function getClient(){
    if(client) return client;
    if(!window.supabase || typeof window.supabase.createClient !== "function"){
      throw new Error("Không tải được thư viện xác thực. Hãy kiểm tra kết nối Internet.");
    }
    client = window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
      auth:{
        persistSession:true,
        autoRefreshToken:true,
        detectSessionInUrl:true,
        flowType:"pkce"
      }
    });
    client.auth.onAuthStateChange((event,session)=>{
      if(event==="SIGNED_OUT"){
        currentProfile=null;
        if(changeHandler) changeHandler(null,null,event);
        return;
      }
      Promise.resolve().then(async()=>{
        const profile=session?.user ? await loadProfile(session.user.id) : null;
        currentProfile=profile;
        if(changeHandler) changeHandler(session,profile,event);
      });
    });
    return client;
  }

  async function loadProfile(userId){
    const {data,error}=await getClient()
      .from("profiles")
      .select("id,email,full_name,role,avatar_url,created_at,updated_at")
      .eq("id",userId)
      .maybeSingle();
    if(error) throw error;
    return data;
  }

  async function init(){
    const c=getClient();
    const {data,error}=await c.auth.getSession();
    if(error) throw error;
    const session=data.session;
    currentProfile=session?.user ? await loadProfile(session.user.id) : null;
    return {session,profile:currentProfile};
  }

  async function signUp({fullName,email,password}){
    const {data,error}=await getClient().auth.signUp({
      email:email.trim().toLowerCase(),
      password,
      options:{data:{full_name:fullName.trim()}}
    });
    if(error) throw error;
    if(data.session){
      currentProfile=await loadProfile(data.user.id);
    }
    return {user:data.user,session:data.session,profile:currentProfile};
  }

  async function signIn({email,password}){
    const {data,error}=await getClient().auth.signInWithPassword({
      email:email.trim().toLowerCase(),password
    });
    if(error) throw error;
    currentProfile=await loadProfile(data.user.id);
    return {user:data.user,session:data.session,profile:currentProfile};
  }

  async function signOut(){
    const {error}=await getClient().auth.signOut();
    if(error) throw error;
    currentProfile=null;
  }

  async function resetPassword(email){
    const redirectTo=window.location.origin+window.location.pathname;
    const {error}=await getClient().auth.resetPasswordForEmail(
      email.trim().toLowerCase(),{redirectTo}
    );
    if(error) throw error;
  }

  async function updatePassword(password){
    const {error}=await getClient().auth.updateUser({password});
    if(error) throw error;
  }

  async function listProfiles(){
    if(currentProfile?.role!=="admin"){
      throw new Error("Tài khoản không có quyền quản trị.");
    }
    const {data,error}=await getClient()
      .from("profiles")
      .select("id,email,full_name,role,created_at")
      .order("created_at",{ascending:false});
    if(error) throw error;
    return data||[];
  }

  function onChange(handler){changeHandler=handler;}
  function getProfile(){return currentProfile;}

  window.EduverseAuth={
    init,signUp,signIn,signOut,resetPassword,updatePassword,
    listProfiles,onChange,getProfile
  };
})();
