// ===== MÔ PHỎNG (canvas) =====
const TAU = Math.PI*2, clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
function simLabel(ctx,txt,x,y,align){
  ctx.font = 'bold 12px "Times New Roman",Times,serif';
  ctx.textAlign = align||"left"; ctx.lineJoin = "round"; ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(0,0,0,.6)"; ctx.strokeText(txt,x,y);
  ctx.fillStyle = "#fff"; ctx.fillText(txt,x,y);
}


// Hạt nhiễu để tạo bề mặt đá, đất có vân thật hơn
function makeGrain(){
  const c = document.createElement("canvas"); c.width = c.height = 96;
  const g = c.getContext("2d"), id = g.createImageData(96,96);
  for(let i=0;i<id.data.length;i+=4){ const v = 110+Math.random()*145; id.data[i]=id.data[i+1]=id.data[i+2]=v; id.data[i+3]=255; }
  g.putImageData(id,0,0); return c;
}
