#version 300 es

layout(location=0)in vec3 a_position;
layout(location=1)in vec2 a_uv;

uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_modelMatrix;
uniform float u_size;
uniform float u_geometrySize;
uniform sampler2D u_displacementMap;
uniform sampler2D u_normalMap;
uniform float u_time;
uniform vec2 u_windDirection;

out vec3 v_position;
out vec2 v_uv;

void main(){
  float repeatRatio=2.;
  vec2 uv=a_uv*repeatRatio;
  uv=u_time*u_windDirection+uv;
  vec3 position=a_position+texture(u_displacementMap,uv).r*texture(u_normalMap,uv).rgb*(u_geometrySize/u_size);
  v_position=(u_modelMatrix*vec4(position,1.f)).xyz;
  v_uv=uv;
  
  gl_Position=u_projectionMatrix*u_viewMatrix*u_modelMatrix*vec4(position,1.f);
}
