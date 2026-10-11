const qs=new URLSearchParams(location.search);
const W=+qs.get('w')||1600, H=+qs.get('h')||900, scene=+qs.get('scene')||0;
const cv=document.getElementById('c'); cv.width=W; cv.height=H;
const gl=cv.getContext('webgl2',{preserveDrawingBuffer:true});
const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o;};
const pr=gl.createProgram();
gl.attachShader(pr,sh(gl.VERTEX_SHADER,'#version 300 es\nin vec2 a;void main(){gl_Position=vec4(a,0,1);}'));
gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,window.FRAG));
gl.linkProgram(pr); if(!gl.getProgramParameter(pr,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
gl.useProgram(pr);
const b=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
const al=gl.getAttribLocation(pr,'a'); gl.enableVertexAttribArray(al); gl.vertexAttribPointer(al,2,gl.FLOAT,false,0,0);
gl.uniform2f(gl.getUniformLocation(pr,'R'),W,H); gl.uniform1i(gl.getUniformLocation(pr,'S'),scene); gl.uniform1f(gl.getUniformLocation(pr,'SEED'),3.7);
gl.viewport(0,0,W,H); gl.enable(gl.SCISSOR_TEST);
// 細い帯に分けて描画（ソフトウェアGPUのタイムアウト対策）
window.renderStrip=(y0,y1)=>{ gl.scissor(0,y0,W,y1-y0); gl.drawArrays(gl.TRIANGLES,0,3); gl.finish(); return true; };
window.ready=true;
