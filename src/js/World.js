export class World {
  constructor(image){
    this.image=image;this.cols=42;this.rows=64;this.tile=96;
    // The original full-map export uses 24px tiles, rendered at 4× in the game.
    // Identify the uniform road tile by its dominant interior color.
    const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);const data=ctx.getImageData(0,0,c.width,c.height).data;
    const color=(x,y)=>{const i=(y*c.width+x)*4;return `${data[i]},${data[i+1]},${data[i+2]}`;};
    const road=color(20*24+12,54*24+12);
    this.grid=Array.from({length:64},(_,y)=>Array.from({length:42},(_,x)=>{let matches=0;for(let dy=4;dy<21;dy+=4)for(let dx=4;dx<21;dx+=4)if(color(x*24+dx,y*24+dy)===road)matches++;return matches>=20?0:1;}));
    this.cells=[];const reachable=this.distances(20,54);for(let y=0;y<64;y++)for(let x=0;x<42;x++)if(reachable.has(`${x},${y}`))this.cells.push({x,y});
  }
  open(x,y){return this.grid[y]?.[x]===0;}
  neighbors(x,y){return [[0,-1,'up'],[1,0,'right'],[0,1,'down'],[-1,0,'left']].filter(([dx,dy])=>this.open(x+dx,y+dy));}
  distances(x,y){const result=new Map([[`${x},${y}`,0]]),queue=[{x,y}];for(let i=0;i<queue.length;i++){const p=queue[i],d=result.get(`${p.x},${p.y}`);for(const [dx,dy] of this.neighbors(p.x,p.y)){const nx=p.x+dx,ny=p.y+dy,k=`${nx},${ny}`;if(!result.has(k)){result.set(k,d+1);queue.push({x:nx,y:ny});}}}return result;}
  positions(count){const pool=this.cells.filter(p=>p.x>=5&&p.x<=36&&p.y>=4&&p.y<=59&&!(p.x>=13&&p.x<=28&&p.y>=49));for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}return pool.slice(0,count);}
  draw(ctx,cx,cy){ctx.drawImage(this.image,0,0,4032,6144);}
}
